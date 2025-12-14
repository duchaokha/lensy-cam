import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);

  const categories = ['DSLR', 'Mirrorless', 'Cinema', 'Action', 'Drone', 'Lens', 'Accessories'];
  const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')} ₫`;

  useEffect(() => {
    loadCameras();
  }, [searchTerm, statusFilter, categoryFilter]);

  const loadCameras = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await api.getCameras(params);
      setCameras(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const camera = Object.fromEntries(formData.entries());

    try {
      if (editingCamera) {
        await api.updateCamera(editingCamera.id, camera);
      } else {
        await api.createCamera(camera);
      }
      setShowModal(false);
      setEditingCamera(null);
      loadCameras();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa máy ảnh này?')) return;

    try {
      await api.deleteCamera(id);
      loadCameras();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (camera = null) => {
    setEditingCamera(camera);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Đang tải máy ảnh</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Kho Máy Ảnh</h2>
        <p>Quản lý thiết bị máy ảnh của bạn</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <button onClick={() => openModal()} className="btn btn-primary">
            + Thêm Máy Ảnh
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Tìm kiếm máy ảnh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả Trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="rented">Đang cho thuê</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Tất cả Loại</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Hãng/Dòng máy</th>
                <th>Loại</th>
                <th>Số serial</th>
                <th>Giá theo ngày</th>
                <th>Giá theo giờ</th>
                <th>Trạng thái</th>
                <th>Tình trạng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((camera) => (
                <tr key={camera.id}>
                  <td><strong>{camera.name}</strong></td>
                  <td>{camera.brand} {camera.model}</td>
                  <td>{camera.category}</td>
                  <td>{camera.serial_number || 'N/A'}</td>
                  <td>{formatCurrency(camera.daily_rate)}</td>
                  <td>{camera.hourly_rate ? formatCurrency(camera.hourly_rate) : 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${
                      camera.status === 'available' ? 'success' :
                      camera.status === 'rented' ? 'warning' : 'secondary'
                    }`}>
                      {camera.status}
                    </span>
                  </td>
                  <td>{camera.condition}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => openModal(camera)}
                        className="btn btn-secondary btn-small"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(camera.id)}
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

        {cameras.length === 0 && (
          <div className="empty-state">
            <h3>Không tìm thấy máy ảnh</h3>
            <p>Thêm máy ảnh đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCamera ? 'Sửa Máy Ảnh' : 'Thêm Máy Ảnh'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Máy Ảnh *</label>
                <input
                  name="name"
                  defaultValue={editingCamera?.name}
                  required
                  placeholder="vd: Canon EOS R5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hãng *</label>
                  <input
                    name="brand"
                    defaultValue={editingCamera?.brand}
                    required
                    placeholder="vd: Canon"
                  />
                </div>

                <div className="form-group">
                  <label>Dòng máy *</label>
                  <input
                    name="model"
                    defaultValue={editingCamera?.model}
                    required
                    placeholder="vd: EOS R5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại *</label>
                  <select name="category" defaultValue={editingCamera?.category} required>
                    <option value="">Chọn loại</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Số serial</label>
                  <input
                    name="serial_number"
                    defaultValue={editingCamera?.serial_number}
                    placeholder="Tùy chọn"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày mua</label>
                  <input
                    type="date"
                    name="purchase_date"
                    defaultValue={editingCamera?.purchase_date}
                  />
                </div>

                <div className="form-group">
                  <label>Giá mua</label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price"
                    defaultValue={editingCamera?.purchase_price}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá theo ngày</label>
                  <input
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    defaultValue={editingCamera?.daily_rate || 0}
                    placeholder="0.00"
                  />
                  <small>Để trống hoặc 0 nếu không cho thuê theo ngày</small>
                </div>

                <div className="form-group">
                  <label>Giá theo giờ</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    defaultValue={editingCamera?.hourly_rate || 0}
                    placeholder="0.00"
                  />
                  <small>Để trống hoặc 0 nếu không cho thuê theo giờ</small>
                </div>
              </div>

              <div className="form-group">
                <label>Tình trạng *</label>
                <select name="condition" defaultValue={editingCamera?.condition || 'excellent'} required>
                  <option value="excellent">Xuất sắc</option>
                  <option value="good">Tốt</option>
                  <option value="fair">Khá</option>
                  <option value="poor">Kém</option>
                </select>
              </div>

              {editingCamera && (
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" defaultValue={editingCamera?.status}>
                    <option value="available">Sẵn sàng</option>
                    <option value="rented">Đang cho thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  defaultValue={editingCamera?.description}
                  placeholder="Thông tin chi tiết về máy ảnh..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCamera ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cameras;
