import schemaDefinition from './schema.json';
import { restoreSourceMedia } from './media';

type Relation = { table: string; local: string; foreign: string; many: boolean };
type Table = { columns: Record<string, { type: string; generated: boolean }>; relations: Record<string, Relation> };
const schema = schemaDefinition as Record<string, Table>;

export function sqlIdentifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) throw new Error('Identifiant SQL invalide');
  return '"' + value + '"';
}

export function sqlLiteral(value: unknown): string {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Nombre invalide');
    return String(value);
  }
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (text.includes('\0')) throw new Error('Valeur invalide');
  return "E'" + text.replaceAll('\\', '\\\\').replaceAll("'", "''") + "'";
}

// Split PostgREST projections/lists while preserving nested joins and quoted
// commas. All identifiers are subsequently checked against the actual schema.
function split(value: string, delimiter = ','): string[] {
  const parts: string[] = [];
  let depth = 0, quoted = false, start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\\') { i++; continue; }
    if (value[i] === '"') quoted = !quoted;
    if (!quoted) {
      if (value[i] === '(') depth++;
      if (value[i] === ')') depth--;
      if (value[i] === delimiter && depth === 0) { parts.push(value.slice(start, i)); start = i + 1; }
    }
  }
  if (depth !== 0 || quoted) throw new Error('Projection invalide');
  parts.push(value.slice(start));
  return parts.map(v => v.trim()).filter(Boolean);
}

function table(name: string): Table {
  if (!Object.hasOwn(schema, name)) throw new Error('Table inconnue');
  return schema[name];
}

function column(name: string, tableName: string, alias = 't') {
  if (!Object.hasOwn(table(tableName).columns, name)) throw new Error('Colonne inconnue');
  return `${sqlIdentifier(alias)}.${sqlIdentifier(name)}`;
}

function projection(value: string, tableName: string, alias = 't', depth = 0): string {
  if (depth > 5) throw new Error('Projection trop profonde');
  const expressions: string[] = [];
  for (const part of split(value)) {
    if (part === '*') { expressions.push(`to_jsonb(${sqlIdentifier(alias)})`); continue; }
    const nested = /^([a-zA-Z_][\w]*(?::[a-zA-Z_][\w]*)?)\((.*)\)$/.exec(part);
    if (nested) {
      const [output, relationName] = nested[1].includes(':') ? nested[1].split(':') : [nested[1], nested[1]];
      const relation = table(tableName).relations[relationName];
      if (!relation) throw new Error('Relation inconnue');
      const child = `r${depth + 1}`;
      const record = projection(nested[2], relation.table, child, depth + 1);
      const condition = `${column(relation.foreign, relation.table, child)} = ${column(relation.local, tableName, alias)}`;
      const from = `FROM app.${sqlIdentifier(relation.table)} ${sqlIdentifier(child)} WHERE ${condition}`;
      const query = relation.many
        ? `(SELECT coalesce(jsonb_agg(nested_record), '[]'::jsonb) FROM (SELECT ${record} nested_record ${from}) nested_rows)`
        : `(SELECT ${record} ${from} LIMIT 1)`;
      expressions.push(`jsonb_build_object(${sqlLiteral(output)}, ${query})`);
    } else {
      const [output, name] = part.includes(':') ? part.split(':') : [part, part];
      sqlIdentifier(output);
      expressions.push(`jsonb_build_object(${sqlLiteral(output)}, ${column(name, tableName, alias)})`);
    }
  }
  if (!expressions.length) throw new Error('Projection vide');
  return expressions.join(' || ');
}

function typeFor(tableName: string, name: string) {
  const type = table(tableName).columns[name]?.type;
  if (!type) throw new Error('Colonne inconnue');
  return ['product_category', 'product_status', 'order_status', 'blog_post_status'].includes(type) ? `app.${sqlIdentifier(type)}` : type;
}

function typedValue(tableName: string, name: string, value: unknown): string {
  value = restoreSourceMedia(value);
  const type = typeFor(tableName, name);
  if (value === null) return 'NULL';
  if (type.endsWith('[]') && Array.isArray(value)) {
    const element = type.slice(0, -2);
    return `ARRAY[${value.map(v => `${sqlLiteral(v)}::${element}`).join(',')}]::${type}`;
  }
  return `${sqlLiteral(value)}::${type}`;
}

function condition(tableName: string, key: string, raw: string): string {
  const left = column(key, tableName);
  const negate = raw.startsWith('not.');
  if (negate) raw = raw.slice(4);
  const separator = raw.indexOf('.');
  if (separator < 0) throw new Error('Filtre invalide');
  const operator = raw.slice(0, separator), value = raw.slice(separator + 1);
  const compare: Record<string, string> = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'LIKE', ilike: 'ILIKE', cs: '@>', cd: '<@' };
  let expression: string;
  if (operator === 'is') {
    if (!['null', 'true', 'false'].includes(value)) throw new Error('Filtre IS invalide');
    expression = `${left} IS ${value.toUpperCase()}`;
  } else if (operator === 'in') {
    if (!value.startsWith('(') || !value.endsWith(')')) throw new Error('Liste invalide');
    const values = split(value.slice(1, -1)).map(v => v.startsWith('"') ? JSON.parse(v) : v);
    expression = values.length ? `${left} IN (${values.map(v => typedValue(tableName, key, v)).join(',')})` : 'FALSE';
  } else if (compare[operator]) {
    const operand = ['like', 'ilike'].includes(operator) ? sqlLiteral(value.replaceAll('*', '%')) : typedValue(tableName, key, value);
    expression = `${left} ${compare[operator]} ${operand}`;
  } else throw new Error('Opérateur non pris en charge');
  return negate ? `NOT (${expression})` : expression;
}

function where(tableName: string, params: URLSearchParams) {
  const filters: string[] = [];
  const reserved = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
  for (const [key, value] of params) {
    if (reserved.has(key)) continue;
    if (key === 'or' || key === 'and') {
      if (!value.startsWith('(') || !value.endsWith(')')) throw new Error('Groupe invalide');
      filters.push('(' + split(value.slice(1, -1)).map(v => {
        const at = v.indexOf('.');
        return condition(tableName, v.slice(0, at), v.slice(at + 1));
      }).join(key === 'or' ? ' OR ' : ' AND ') + ')');
    } else filters.push(condition(tableName, key, value));
  }
  return filters.length ? ' WHERE ' + filters.join(' AND ') : '';
}

function integer(value: string | null, fallback: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) throw new Error('Pagination invalide');
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new Error('Pagination invalide');
  return number;
}

export type CompiledQuery = { sql: string; write: boolean; count: boolean; head: boolean; single: boolean; returnRows: boolean; offset: number };

/** Compile the requests produced by the existing typed query builder. This
 * module runs on the server; no SQL or service credential reaches visitors. */
export function compileQuery(url: URL, method: string, headers: Headers, body?: unknown): CompiledQuery {
  const tableName = decodeURIComponent(url.pathname.split('/').pop()!);
  table(tableName);
  const params = url.searchParams;
  const select = params.get('select') || '*';
  const record = projection(select, tableName);
  const filter = where(tableName, params);
  const offset = integer(params.get('offset'), 0);
  const limit = Math.min(integer(params.get('limit'), 10000), 10000);
  const prefer = headers.get('prefer') || '';
  const count = /count=(exact|planned|estimated)/.test(prefer);
  const write = !['GET', 'HEAD'].includes(method);
  let order = '';
  if (params.has('order')) {
    order = ' ORDER BY ' + split(params.get('order')!).map(value => {
      const [name, direction = 'asc', nulls] = value.split('.');
      if (!['asc', 'desc'].includes(direction) || (nulls && !['nullsfirst', 'nullslast'].includes(nulls))) throw new Error('Tri invalide');
      return column(name, tableName) + ' ' + direction.toUpperCase() + (nulls ? ' NULLS ' + (nulls === 'nullsfirst' ? 'FIRST' : 'LAST') : '');
    }).join(',');
  }
  let sql: string;
  const target = `app.${sqlIdentifier(tableName)}`;
  if (!write) {
    sql = `WITH filtered AS (SELECT * FROM ${target} t${filter}), selected AS (SELECT ${record} record FROM filtered t${order} LIMIT ${limit} OFFSET ${offset}) SELECT jsonb_build_object('rows', coalesce((SELECT jsonb_agg(record) FROM selected),'[]'::jsonb), 'count', ${count ? '(SELECT count(*) FROM filtered)' : 'NULL'})`;
  } else {
    let mutation: string;
    if (method === 'POST') {
      const rows = Array.isArray(body) ? body : [body];
      if (!rows.length || rows.some(r => !r || typeof r !== 'object' || Array.isArray(r))) throw new Error('Données invalides');
      const fields = [...new Set(rows.flatMap(r => Object.keys(r)))];
      for (const field of fields) {
        column(field, tableName);
        if (table(tableName).columns[field].generated) throw new Error('Colonne générée non modifiable');
      }
      if (!fields.length) throw new Error('Insertion vide');
      mutation = `INSERT INTO ${target} (${fields.map(sqlIdentifier).join(',')}) VALUES ` + rows.map(r => '(' + fields.map(f => Object.hasOwn(r, f) ? typedValue(tableName, f, r[f]) : 'DEFAULT').join(',') + ')').join(',');
      if (prefer.includes('resolution=')) {
        const conflict = split(params.get('on_conflict') || 'id');
        conflict.forEach(f => column(f, tableName));
        const updates = fields.filter(f => !conflict.includes(f));
        mutation += ` ON CONFLICT (${conflict.map(sqlIdentifier).join(',')}) ` + (prefer.includes('ignore-duplicates') || !updates.length ? 'DO NOTHING' : 'DO UPDATE SET ' + updates.map(f => `${sqlIdentifier(f)} = EXCLUDED.${sqlIdentifier(f)}`).join(','));
      }
    } else if (method === 'PATCH') {
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Données invalides');
      const values = body as Record<string, unknown>;
      const fields = Object.keys(values);
      if (!fields.length) throw new Error('Modification vide');
      mutation = `UPDATE ${target} t SET ` + fields.map(f => { column(f, tableName); return `${sqlIdentifier(f)} = ${typedValue(tableName, f, values[f])}`; }).join(',') + filter;
    } else if (method === 'DELETE') mutation = `DELETE FROM ${target} t${filter}`;
    else throw new Error('Méthode non prise en charge');
    sql = `WITH mutation AS (${mutation} RETURNING *) SELECT jsonb_build_object('rows', coalesce(jsonb_agg(${record}), '[]'::jsonb), 'count', count(*)) FROM mutation t`;
  }
  return { sql, write, count, head: method === 'HEAD', single: (headers.get('accept') || '').includes('application/vnd.pgrst.object+json'), returnRows: !write || prefer.includes('return=representation'), offset };
}
