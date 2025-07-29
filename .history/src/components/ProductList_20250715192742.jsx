import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Available Products</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => (
          <div className="col" key={product.id}>
            <div className="card h-100 shadow-sm">
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.productName}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title text-capitalize">{product.productName}</h5>
                <p className="card-text mb-1">
                  <strong>Store:</strong> {product.storeQty}
                </p>
                <p className="card-text mb-1">
                  <strong>Shop:</strong> {product.shopQty}
                </p>
                <p className="card-text">
                  <strong>Total:</strong>{" "}
                  <span className="badge bg-success">{product.totalQty}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
