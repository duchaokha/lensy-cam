import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  const loadCustomers = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const data = await api.getCustomers(params);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData.entries());

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, customer);
      } else {
        await api.createCustomer(customer);
      }
      setShowModal(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (customer = null) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Đang tải khách hàng</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Khách hàng</h2>
        <p>Quản lý cơ sở dữ liệu khách hàng</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            + Thêm Khách hàng
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Số CMND</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.email || 'N/A'}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>{customer.address || 'N/A'}</td>
                  <td>{customer.id_number || 'N/A'}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => openModal(customer)}
                        className="btn btn-secondary btn-small"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="btn btn-danger btn-small"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="empty-state">
            <h3>Không tìm thấy khách hàng</h3>
            <p>Thêm khách hàng đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? 'Sửa Khách hàng' : 'Thêm Khách hàng'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  name="name"
                  defaultValue={editingCustomer?.name}
                  required
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingCustomer?.email}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingCustomer?.phone}
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  name="address"
                  defaultValue={editingCustomer?.address}
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                />
              </div>

              <div className="form-group">
                <label>Số CMND</label>
                <input
                  name="id_number"
                  defaultValue={editingCustomer?.id_number}
                  placeholder="CMND hoặc CCCD"
                />
                <small>Để xác minh khi thuê</small>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  defaultValue={editingCustomer?.notes}
                  placeholder="Thông tin bổ sung về khách hàng..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
