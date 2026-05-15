import sql from "../../../store/database";

export async function list() {
  const [list] =
    await sql`SELECT id,nombre,descripcion,monto,fecha FROM caja_reposicion_stock`;
  return list;
}

export async function add({ nombre, descripcion, monto }) {
  await sql`INSERT INTO caja_reposicion_stock (nombre,descripcion,monto,fecha) VALUES (${nombre},${descripcion},${monto},NOW())`;
}

export async function update({ nombre, descripcion, monto }) {
  await sql`UPDATE caja_reposicion_stock SET nombre = ${nombre} , descripcion = ${descripcion}, monto = ${monto}`;
}

export async function remove({ id }) {
  await sql`DELETE FROM caja_reposicion_stock WHERE id = ${id}`;
}

//export default { add, list, remove, update };
