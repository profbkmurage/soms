import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTranslation } from "react-i18next";

const SupplierModal = ({ show, handleClose, supplier, refreshSuppliers }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState({
    name: "",
    email: "",
    phone: "",
    products: [],
  });

  // Fetch supplier details when modal opens
  useEffect(() => {
    const fetchSupplier = async () => {
      if (supplier) {
        setLoading(true);
        try {
          const supplierRef = doc(db, "suppliers", supplier.id);
          const snap = await getDoc(supplierRef);
          if (snap.exists()) {
            setSupplierData(snap.data());
          }
        } catch (err) {
          console.error("Error fetching supplier:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSupplier();
  }, [supplier]);

  // Handle input changes
  const handleChange = (field, value) => {
    setSupplierData((prev) => ({ ...prev, [field]: value }));
  };

  // Save updates
  const handleSave = async () => {
    if (!supplier) return;
    setLoading(true);
    try {
      const supplierRef = doc(db, "suppliers", supplier.id);
      await updateDoc(supplierRef, supplierData);
      refreshSuppliers();
      handleClose();
    } catch (err) {
      console.error("Error updating supplier:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{t("supplierModal.title")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <p>{t("supplierModal.loading")}</p>
        ) : (
          <Form>
            {/* Responsive form fields */}
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <Form.Group controlId="supplierName" className="mb-3">
                  <Form.Label>{t("supplierModal.name")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={supplierData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group controlId="supplierEmail" className="mb-3">
                  <Form.Label>{t("supplierModal.email")}</Form.Label>
                  <Form.Control
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group controlId="supplierPhone" className="mb-3">
                  <Form.Label>{t("supplierModal.phone")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={supplierData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group controlId="supplierProducts" className="mb-3">
                  <Form.Label>{t("supplierModal.products")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={t("supplierModal.productsPlaceholder")}
                    value={supplierData.products.join(", ")}
                    onChange={(e) =>
                      handleChange(
                        "products",
                        e.target.value.split(",").map((p) => p.trim())
                      )
                    }
                  />
                </Form.Group>
              </div>
            </div>

            {/* Products Preview Table */}
            <div className="table-responsive mt-3">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>{t("supplierModal.productList")}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierData.products && supplierData.products.length > 0 ? (
                    supplierData.products.map((prod, idx) => (
                      <tr key={idx}>
                        <td>{prod}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>{t("supplierModal.noProducts")}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("supplierModal.close")}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {t("supplierModal.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SupplierModal;
