import sql from "../../../store/database";

export async function add({ descripcion, monto }) {
  await sql`INSERT INTO gastos  (descripcion,monto,fecha) VALUES (${nombre},${descripcion},${monto},NOW())`;
}

export async function list() {
  const [gastos] = await sql`SELECT descripcion, monto , fecha FROM gastos`;
  return gastos;
}
export async function remove({ id }) {
  await sql`DELETE FROM gastos WHERE id= ${id}`;
}

export async function update({ descripcion, monto, id }) {
  const [gastos] =
    sql`UPDATE gastos SET descripcion = ${descripcion} , monto=${monto} WHERE id=${id}`;
}

//export default { list, add, remove, update };
