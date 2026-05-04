import statusNetwork from "./components/status/network";
import inversionNetwork from "./components/cajaInversion/network";
import gastosNetwork from "./components/cajaGastosOperativos/network";
import deudoresNetwork from "./components/deudores/network";
import reposicionStockNetwork from "./components/cajaReposicionStock/network";
export default (server) => {
  server.use("/api", statusNetwork);
  server.use("/api", inversionNetwork);
  server.use("/api", gastosNetwork);
  server.use("/api", deudoresNetwork);
  server.use("/api", reposicionStockNetwork);
};
