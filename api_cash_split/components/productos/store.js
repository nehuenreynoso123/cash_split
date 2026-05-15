import sql from "../../../store/database";

export async function list() {
  const [list] = await sql`SELECT * FROM productos`;
  return list;
}

export async function add({ nombre, precio, stock }) {
  await sql`INSERT INTO productos (nombre,precio,stock) VALUES (${nombre},${precio},${stock})`;
}

export async function edit({ nombre, precio, stock }) {
  await sql`UPDATE productos SET (nombre=${nombre},precio=${precio},stock=${stock})`;
}

export async function remove({ id }) {
  await sql`DELETE FROM productos WHERE id=${id}`;
}
