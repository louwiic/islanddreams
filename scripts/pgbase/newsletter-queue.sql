-- Private persistent queue. Run using a direct connection as the project owner.
BEGIN;
CREATE TABLE IF NOT EXISTS app.newsletter_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_key uuid UNIQUE NOT NULL,
 fingerprint text NOT NULL, subject text NOT NULL, html text NOT NULL,
 scheduled_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','sending','completed','completed_with_errors','cancelled')),
 prepared_at timestamptz, finished_at timestamptz,
 lease_token uuid, lease_until timestamptz, last_error text
);
-- migration-step
ALTER TABLE app.newsletter_jobs ENABLE ROW LEVEL SECURITY;
-- migration-step
CREATE TABLE IF NOT EXISTS app.newsletter_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_id uuid NOT NULL REFERENCES app.newsletter_jobs(id),
 email text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','skipped','failed')),
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 first_attempt_at timestamptz, message jsonb, provider_id text, last_error text,
 UNIQUE(job_id,email)
);
-- migration-step
ALTER TABLE app.newsletter_deliveries ENABLE ROW LEVEL SECURITY;
-- migration-step
CREATE INDEX IF NOT EXISTS newsletter_jobs_due ON app.newsletter_jobs(scheduled_at) WHERE status IN ('scheduled','sending');
-- migration-step
CREATE INDEX IF NOT EXISTS newsletter_deliveries_pending ON app.newsletter_deliveries(job_id,next_attempt_at) WHERE status IN ('pending','processing');
-- migration-step
CREATE TABLE IF NOT EXISTS app.newsletter_worker_state (singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), last_seen_at timestamptz NOT NULL, dry_run boolean NOT NULL);
-- migration-step
ALTER TABLE app.newsletter_worker_state ENABLE ROW LEVEL SECURITY;
-- migration-step
CREATE OR REPLACE FUNCTION app.newsletter_queue(action text, payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = app,pg_catalog AS $queue$
DECLARE j app.newsletter_jobs; d app.newsletter_deliveries; result jsonb; job_uuid uuid; token uuid;
BEGIN
 IF current_user <> session_user THEN RAISE EXCEPTION 'Project server key required'; END IF;
 IF action = 'list' THEN
  SELECT jsonb_build_object('jobs',coalesce(jsonb_agg(row),'[]'::jsonb),'worker',(SELECT to_jsonb(w) FROM app.newsletter_worker_state w LIMIT 1)) INTO result
  FROM (SELECT qj.id,qj.subject,qj.scheduled_at,qj.created_at,qj.status,qj.last_error,qj.finished_at,
   count(qd.id) AS total,count(qd.id) FILTER(WHERE qd.status='sent') AS sent,
   count(qd.id) FILTER(WHERE qd.status='skipped') AS skipped,count(qd.id) FILTER(WHERE qd.status='failed') AS failed
   FROM (SELECT * FROM app.newsletter_jobs ORDER BY created_at DESC LIMIT 100) qj
   LEFT JOIN app.newsletter_deliveries qd ON qd.job_id=qj.id GROUP BY qj.id,qj.subject,qj.scheduled_at,qj.created_at,qj.status,qj.last_error,qj.finished_at ORDER BY qj.created_at DESC) row;
  RETURN result;
 ELSIF action = 'enqueue' THEN
  IF (payload->>'scheduledAt')::timestamptz < now()+interval '1 minute' THEN RAISE EXCEPTION 'DATE_TOO_SOON'; END IF;
  INSERT INTO app.newsletter_jobs(request_key,fingerprint,subject,html,scheduled_at)
   VALUES((payload->>'requestKey')::uuid,payload->>'fingerprint',payload->>'subject',payload->>'html',(payload->>'scheduledAt')::timestamptz)
   ON CONFLICT(request_key) DO NOTHING RETURNING * INTO j;
  IF j.id IS NULL THEN SELECT * INTO j FROM app.newsletter_jobs WHERE request_key=(payload->>'requestKey')::uuid; END IF;
  IF j.fingerprint <> payload->>'fingerprint' THEN RAISE EXCEPTION 'REQUEST_CONFLICT'; END IF;
  RETURN jsonb_build_object('id',j.id,'status',j.status,'scheduledAt',j.scheduled_at);
 ELSIF action = 'cancel' THEN
  UPDATE app.newsletter_jobs SET status='cancelled',finished_at=now() WHERE id=(payload->>'id')::uuid AND status='scheduled' RETURNING * INTO j;
  RETURN jsonb_build_object('cancelled',j.id IS NOT NULL);
 ELSIF action = 'heartbeat' THEN
  INSERT INTO app.newsletter_worker_state(singleton,last_seen_at,dry_run) VALUES(true,now(),coalesce((payload->>'dryRun')::boolean,true))
  ON CONFLICT(singleton) DO UPDATE SET last_seen_at=now(),dry_run=excluded.dry_run;
  RETURN jsonb_build_object('ok',true);
 ELSIF action = 'claim' THEN
  SELECT * INTO j FROM app.newsletter_jobs WHERE status IN ('scheduled','sending') AND scheduled_at<=now()
   AND (lease_until IS NULL OR lease_until<now())
   AND (prepared_at IS NULL
    OR NOT EXISTS(SELECT 1 FROM app.newsletter_deliveries qd WHERE qd.job_id=newsletter_jobs.id AND qd.status IN ('pending','processing'))
    OR EXISTS(SELECT 1 FROM app.newsletter_deliveries qd WHERE qd.job_id=newsletter_jobs.id AND qd.status IN ('pending','processing') AND qd.next_attempt_at<=now()))
   ORDER BY scheduled_at FOR UPDATE SKIP LOCKED LIMIT 1;
  IF j.id IS NULL THEN RETURN NULL; END IF;
  UPDATE app.newsletter_jobs SET status='sending',lease_token=gen_random_uuid(),lease_until=now()+interval '2 minutes'
   WHERE id=j.id RETURNING * INTO j;
  RETURN to_jsonb(j);
 END IF;
 job_uuid := (payload->>'jobId')::uuid; token := (payload->>'token')::uuid;
 SELECT * INTO j FROM app.newsletter_jobs WHERE id=job_uuid AND status='sending' AND lease_token=token AND lease_until>now() FOR UPDATE;
 IF j.id IS NULL THEN RETURN NULL; END IF;
 IF action = 'prepare' THEN
  IF j.prepared_at IS NULL THEN
   INSERT INTO app.newsletter_deliveries(job_id,email)
    SELECT j.id,lower(btrim(email)) FROM app.newsletter_subscribers
    WHERE email IS NOT NULL AND btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    GROUP BY lower(btrim(email)) HAVING bool_and(unsubscribed_at IS NULL) ON CONFLICT(job_id,email) DO NOTHING;
   UPDATE app.newsletter_jobs SET prepared_at=now() WHERE id=j.id;
  END IF;
  RETURN jsonb_build_object('ok',true);
 ELSIF action = 'next' THEN
  SELECT * INTO d FROM app.newsletter_deliveries WHERE job_id=j.id AND status IN ('pending','processing') AND next_attempt_at<=now() ORDER BY next_attempt_at,id LIMIT 1;
  RETURN CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END;
 ELSIF action = 'begin' THEN
  SELECT * INTO d FROM app.newsletter_deliveries WHERE id=(payload->>'deliveryId')::uuid AND job_id=j.id AND status IN ('pending','processing') FOR UPDATE;
  IF d.id IS NULL OR j.lease_until<now()+interval '20 seconds' THEN RETURN NULL; END IF;
  -- Recheck consent immediately before EVERY send, including crash recovery.
  IF NOT EXISTS(SELECT 1 FROM app.newsletter_subscribers WHERE lower(btrim(email))=d.email AND unsubscribed_at IS NULL)
   OR EXISTS(SELECT 1 FROM app.newsletter_subscribers WHERE lower(btrim(email))=d.email AND unsubscribed_at IS NOT NULL) THEN
   UPDATE app.newsletter_deliveries SET status='skipped',last_error='unsubscribed' WHERE id=d.id; RETURN NULL;
  END IF;
  -- Resend retains idempotency keys for 24h. Never automatically replay after 23h.
  IF d.attempts>=5 OR d.first_attempt_at<now()-interval '23 hours' THEN
   UPDATE app.newsletter_deliveries SET status='failed',last_error='manual_review_required' WHERE id=d.id; RETURN NULL;
  END IF;
  UPDATE app.newsletter_deliveries SET status='processing',attempts=attempts+1,
   first_attempt_at=coalesce(first_attempt_at,now()),message=coalesce(message,payload->'message') WHERE id=d.id RETURNING * INTO d;
  RETURN to_jsonb(d);
 ELSIF action = 'finish' THEN
  UPDATE app.newsletter_deliveries SET status=CASE WHEN payload->>'outcome'='sent' THEN 'sent' WHEN payload->>'outcome'='skipped' THEN 'skipped' WHEN payload->>'outcome'='retry' AND attempts<5 THEN 'pending' ELSE 'failed' END,
   provider_id=payload->>'providerId',last_error=payload->>'error',
   next_attempt_at=now()+make_interval(secs=>least(3600,60*power(2,attempts)::integer))
   WHERE id=(payload->>'deliveryId')::uuid AND job_id=j.id AND status='processing';
  RETURN jsonb_build_object('ok',true);
 ELSIF action = 'release' THEN
  UPDATE app.newsletter_jobs SET status=CASE WHEN prepared_at IS NULL THEN 'scheduled'
   WHEN EXISTS(SELECT 1 FROM app.newsletter_deliveries WHERE job_id=j.id AND status IN ('pending','processing')) THEN 'sending'
   WHEN EXISTS(SELECT 1 FROM app.newsletter_deliveries WHERE job_id=j.id AND status='failed') THEN 'completed_with_errors' ELSE 'completed' END,
   finished_at=CASE WHEN prepared_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.newsletter_deliveries WHERE job_id=j.id AND status IN ('pending','processing')) THEN now() ELSE NULL END,
   lease_token=NULL,lease_until=NULL WHERE id=j.id;
  RETURN jsonb_build_object('ok',true);
 END IF;
 RAISE EXCEPTION 'Unknown queue action';
END;
$queue$;
-- migration-step
REVOKE ALL ON FUNCTION app.newsletter_queue(text,jsonb) FROM PUBLIC;
COMMIT;
