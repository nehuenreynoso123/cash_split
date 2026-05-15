import express from "express";
import controller from "./controller";
import response from "../../network/response";

const router = express.Router();

router.post("/producto", [], addProducto);
router.delete("/producto", [], removeProducto);
router.put("/producto", [], editProducto);
router.get("/producto", [], listProducto);

function addProducto(req, resp, next) {
  controller
    .addProducto(req.body)
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

function removeProducto(req, resp, next) {
  controller
    .editProducto(req.params.id)
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

function editProducto(req, resp, next) {
  controller
    .editProducto(req.body)
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

function listProducto(req, resp, next) {
  controller
    .listProducto()
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

export default router;
