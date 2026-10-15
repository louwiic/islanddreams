-- Server-only bridge for the site's typed SQL queries. It is deliberately
-- callable only by the project server key; visitor roles have no EXECUTE grant.
CREATE OR REPLACE FUNCTION app.islanddreams_query(statement text, claims jsonb, access_role text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER AS $body$
DECLARE
  result jsonb;
  previous_role text := current_setting('role');
  owner_name text := session_user;
  target_role text;
BEGIN
  IF current_user <> session_user THEN
    RAISE EXCEPTION 'Project server key required';
  END IF;
  IF access_role NOT IN ('anon', 'authenticated', 'service_role') THEN
    RAISE EXCEPTION 'Invalid access role';
  END IF;
  PERFORM set_config('search_path', 'app, public, pg_catalog', true);
  PERFORM set_config('request.jwt.claims', coalesce(claims, '{}'::jsonb)::text, true);
  IF access_role <> 'service_role' THEN
    target_role := owner_name || '_' || access_role;
    PERFORM set_config('role', target_role, true);
  END IF;
  EXECUTE statement INTO result;
  PERFORM set_config('role', previous_role, true);
  RETURN result;
END;
$body$;
REVOKE ALL ON FUNCTION app.islanddreams_query(text,jsonb,text) FROM PUBLIC;

DO $grants$ BEGIN
  EXECUTE format('REVOKE ALL ON FUNCTION app.islanddreams_query(text,jsonb,text) FROM %I, %I', session_user || '_anon', session_user || '_authenticated');
END $grants$;
INSERT INTO _pgbase.rpc_endpoints(name,function_schema,function_name,function_identity_arguments,access,enabled,timeout_ms,description)
VALUES ('islanddreams_query','app','islanddreams_query','statement text, claims jsonb, access_role text','authenticated',true,15000,'Private Islanddreams server transport; no visitor EXECUTE permission')
ON CONFLICT(name) DO UPDATE SET enabled=true,access='authenticated',timeout_ms=15000;
