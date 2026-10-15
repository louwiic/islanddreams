#!/usr/bin/env python3
"""Rebuild a read-only Supabase GUI export in a disposable PostgreSQL database.

The original export must remain outside Git. The resulting custom pg_dump can
then be inspected by PGBase's Supabase importer before restoring it.
"""
import argparse
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path


def ident(value):
    return '"' + value.replace('"', '""') + '"'


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def rebuild(source, dsn):
    metadata = json.loads((source / 'schema.json').read_text())
    manifest = json.loads((source / 'manifest.json').read_text())
    selected = {(r['schema_name'], r['table_name']) for r in metadata['relations']
                if r['schema_name'] in ('public', 'private')}
    selected.update({('auth', 'users'), ('auth', 'identities'),
                     ('storage', 'buckets'), ('storage', 'objects')})
    sql = ['BEGIN;', 'SET search_path TO public, auth, storage, extensions;',
           'CREATE SCHEMA auth;', 'CREATE SCHEMA storage;', 'CREATE SCHEMA extensions;',
           'CREATE ROLE anon;', 'CREATE ROLE authenticated;', 'CREATE ROLE service_role;',
           'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
           "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\" WITH SCHEMA extensions;",
           "CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;",
           "CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(auth.jwt()->>'sub','')::uuid $$;"]
    for t in metadata['types']:
        if t['schema'] == 'public' or (t['schema'], t['name']) == ('storage', 'buckettype'):
            if t['kind'] != 'e':
                raise ValueError('Unsupported type: ' + t['name'])
            sql.append(f"CREATE TYPE {ident(t['schema'])}.{ident(t['name'])} AS ENUM ({','.join(map(literal,t['enum_labels']))});")
    for s in metadata['sequences']:
        if s['schemaname'] != 'public':
            continue
        name = ident(s['schemaname']) + '.' + ident(s['sequencename'])
        sql.append(f"CREATE SEQUENCE {name} AS {s['data_type']} INCREMENT BY {s['increment_by']} MINVALUE {s['min_value']} MAXVALUE {s['max_value']} START WITH {s['start_value']} CACHE {s['cache_size']} {'CYCLE' if s['cycle'] else 'NO CYCLE'};")
    columns = {}
    for c in metadata['columns']:
        columns.setdefault((c['schema'], c['table']), []).append(c)
    for schema, table in sorted(selected):
        fields = []
        for c in sorted(columns[(schema, table)], key=lambda r: r['position']):
            field = ident(c['name']) + ' ' + c['type']
            if c['generated']:
                field += ' GENERATED ALWAYS AS (' + c['default'] + ') STORED'
            elif c['identity']:
                field += ' GENERATED ' + ('ALWAYS' if c['identity'] == 'a' else 'BY DEFAULT') + ' AS IDENTITY'
            elif c['default']:
                field += ' DEFAULT ' + c['default']
            if c['not_null']:
                field += ' NOT NULL'
            fields.append(field)
        sql.append(f"CREATE TABLE {ident(schema)}.{ident(table)} ({','.join(fields)});")
    for schema, table in sorted(selected):
        raw = (source / 'data' / f'{schema}.{table}.json').read_text()
        rows = json.loads(raw)
        assert len(rows) == manifest['tables'][schema + '.' + table]
        if not rows:
            continue
        fields = ','.join(ident(c['name']) for c in sorted(columns[(schema, table)], key=lambda r: r['position']) if not c['generated'])
        target = ident(schema) + '.' + ident(table)
        sql.append(f"INSERT INTO {target} ({fields}) SELECT {fields} FROM jsonb_populate_recordset(NULL::{target},{literal(raw)}::jsonb);")
    # Constraints are added after all rows, so every foreign key is validated.
    constraints = [c for c in metadata['constraints'] if (c['schema'], c['table']) in selected]
    constraints.sort(key=lambda c: c['type'] == 'f')
    for c in constraints:
        # PG 15+ makes the default NULLS DISTINCT explicit in catalog output.
        # Omitting that default also permits reconstruction with PG 14 tools.
        definition = c['definition'].replace(' NULLS DISTINCT', '')
        sql.append(f"ALTER TABLE {ident(c['schema'])}.{ident(c['table'])} ADD CONSTRAINT {ident(c['name'])} {definition};")
    names = {(c['schema'], c['name']) for c in constraints}
    for idx in metadata['indexes']:
        # Storage internals are not restored by PGBase. Keep their rows for
        # inventory only; their platform indexes can require a newer server.
        if idx['schemaname'] == 'storage':
            continue
        if (idx['schemaname'], idx['tablename']) in selected and (idx['schemaname'], idx['indexname']) not in names:
            sql.append(idx['indexdef'] + ';')
    for fn in metadata['functions']:
        if fn['schema'] in ('public', 'private'):
            sql.append(fn['definition'].rstrip(';\n') + ';')
    for tr in metadata['triggers']:
        if tr['schema'] in ('public', 'private'):
            sql.append(tr['definition'].rstrip(';') + ';')
    for rel in metadata['relations']:
        if rel['schema_name'] in ('public', 'private') and rel['relrowsecurity']:
            sql.append(f"ALTER TABLE {ident(rel['schema_name'])}.{ident(rel['table_name'])} ENABLE ROW LEVEL SECURITY;")
    for p in metadata['policies']:
        if p['schemaname'] not in ('public', 'private'):
            continue
        roles = ','.join('PUBLIC' if r == 'public' else ident(r) for r in p['roles'])
        statement = f"CREATE POLICY {ident(p['policyname'])} ON {ident(p['schemaname'])}.{ident(p['tablename'])} AS {p['permissive']} FOR {p['cmd']} TO {roles}"
        if p['qual']:
            statement += ' USING (' + p['qual'] + ')'
        if p['with_check']:
            statement += ' WITH CHECK (' + p['with_check'] + ')'
        sql.append(statement + ';')
    for s in metadata['sequences']:
        if s['schemaname'] == 'public':
            state = ET.fromstring(s['state_xml']).find('row')
            sql.append(f"SELECT setval({literal(s['schemaname']+'.'+s['sequencename'])}, {int(state.find('last_value').text)}, {state.find('is_called').text});")
    # New Supabase bucket types are platform internals. PGBase imports only
    # name/public/limits, and its staging schema does not contain storage types.
    sql.append('ALTER TABLE storage.buckets DROP COLUMN IF EXISTS type;')
    sql.append('COMMIT;')
    result = subprocess.run(['psql', dsn, '-X', '-q', '-v', 'ON_ERROR_STOP=1'],
                            input='\n'.join(sql), text=True, capture_output=True)
    if result.returncode:
        # PostgreSQL errors can echo private row contents; keep details local.
        error_path = source / 'rebuild-error.log'
        error_path.write_text(result.stderr)
        error_path.chmod(0o600)
        raise RuntimeError('Rebuild failed; inspect private rebuild-error.log')
    expected = {k: v for k, v in manifest['tables'].items() if tuple(k.split('.',1)) in selected}
    for name, count in expected.items():
        schema, table = name.split('.', 1)
        actual = subprocess.check_output(['psql', dsn, '-XAt', '-c', f'SELECT count(*) FROM {ident(schema)}.{ident(table)}'], text=True)
        assert int(actual) == count, name
    print(json.dumps({'verified_tables': len(expected), 'verified_rows': sum(expected.values())}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('export_directory', type=Path)
    parser.add_argument('staging_dsn', help='Disposable database only; schemas must not already exist')
    args = parser.parse_args()
    rebuild(args.export_directory, args.staging_dsn)
