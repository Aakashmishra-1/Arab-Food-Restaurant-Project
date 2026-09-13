import React, { useEffect, useState } from 'react'
import api, { url } from '../../services/api'
import { toast } from 'react-toastify'
import './List.css'


const categories = [
  'Paranthas', 'Breakfast', 'Rice Combo', 'Thali',
  'Rolls', 'Salad', 'Sandwich', 'Deserts', 'Drinks', 'Other'
]

const EditModal = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
  })
  const [variants, setVariants] = useState(item.variants || [])
  const [newImage, setNewImage] = useState(null)
  const [saving, setSaving] = useState(false)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const addVariant = () => setVariants([...variants, { size: 'Small', price: '' }])
  const updateVariant = (i, field, val) => {
    const updated = [...variants]
    updated[i][field] = val
    setVariants(updated)
  }
  const removeVariant = i => setVariants(variants.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', item._id)
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      formData.append('category', form.category)
      const validVariants = variants.filter(v => v.price !== '' && !isNaN(Number(v.price)) && Number(v.price) > 0)
      if (validVariants.length > 0) formData.append('variants', JSON.stringify(validVariants))
      if (newImage) formData.append('image', newImage)
      const res = await api.post('/api/food/update', formData)
      if (res.data.success) {
        toast.success('Item updated!')
        onSaved()
        onClose()
      } else {
        toast.error(res.data.message || 'Update failed')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Food Item</h3>
          <button className="modal-close-btn" onClick={onClose}>x</button>
        </div>

        <div className="edit-modal-body">
          <div className="edit-image-section">
            <img
              src={newImage ? URL.createObjectURL(newImage) : `${url}/images/${item.image}`}
              alt={item.name}
              className="edit-preview-img"
            />
            <label className="change-img-btn" htmlFor="edit-img-input">
              Change Image
            </label>
            <input
              id="edit-img-input"
              type="file"
              accept="image/*"
              hidden
              onChange={e => setNewImage(e.target.files[0])}
            />
            {newImage && <p className="new-img-name">New: {newImage.name}</p>}
          </div>

          <div className="edit-fields">
            <label>
              Item Name
              <input name="name" value={form.name} onChange={onChange} placeholder="Item name" />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Description" />
            </label>
            <div className="edit-row">
              <label>
                Base Price (Rs)
                <input name="price" type="number" min="1" value={form.price} onChange={onChange} />
              </label>
              <label>
                Category
                <select name="category" value={form.category} onChange={onChange}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <div className="edit-variants-section">
              <div className="edit-variants-header">
                <div>
                  <h4>Size Variants <span>(optional)</span></h4>
                </div>
                <button type="button" onClick={addVariant}>+ Add Size</button>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="edit-variant-row">
                  <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}>
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                    <option>Half</option>
                    <option>Full</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={v.price}
                    onChange={e => updateVariant(i, 'price', e.target.value)}
                    min="1"
                  />
                  <button type="button" onClick={() => removeVariant(i)} className="rm-variant-btn">x</button>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="no-variant-msg">No variants — base price will be used</p>
              )}
            </div>
          </div>
        </div>

        <div className="edit-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const List = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)

  const fetchList = async () => {
    try {
      const res = await api.get('/api/food/list')
      if (res.data.success) setList(res.data.data)
    } catch { toast.error('Error fetching food list') }
    setLoading(false)
  }

  useEffect(() => { fetchList() }, [])

  const removeFood = async (id, name) => {
    if (!window.confirm('Remove "' + name + '"?')) return
    const res = await api.post('/api/food/remove', { id })
    if (res.data.success) { toast.success('Item removed'); fetchList() }
    else toast.error('Error removing item')
  }

  const toggleStock = async (id) => {
    const res = await api.post('/api/food/toggle-stock', { id })
    if (res.data.success) fetchList()
    else toast.error('Error updating stock')
  }

  if (loading) return <div className="list-loading">Loading food list...</div>

  return (
    <div className="list-page">
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={fetchList}
        />
      )}

      <div className="list-page-header">
        <h2>Food List</h2>
        <span className="list-count">{list.length} items</span>
      </div>

      {list.length === 0 ? (
        <div className="list-empty">
          <p>No food items added yet.</p>
          <p>Go to Add Item to get started!</p>
        </div>
      ) : (
        <div className="list-table">
          <div className="list-header">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Variants</span>
            <span>Stock</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>
          {list.map(item => (
            <div key={item._id} className={'list-row' + (!item.inStock ? ' oos-row' : '')}>
              <img src={`${url}/images/${item.image}`} alt={item.name} />
              <span className="item-name">{item.name}</span>
              <span className="item-cat-badge">{item.category}</span>
              <span className="item-price">Rs {item.price}</span>
              <span className="item-variants">
                {item.variants && item.variants.length > 0
                  ? item.variants.map(v => v.size + ': Rs ' + v.price).join(' | ')
                  : <span className="no-variant">-</span>
                }
              </span>
              <button
                className={'stock-btn ' + (item.inStock ? 'in-stock' : 'out-stock')}
                onClick={() => toggleStock(item._id)}
              >
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </button>
              <span className="item-rating">
                {item.avgRating > 0 ? item.avgRating + ' (' + item.totalRatings + ')' : '-'}
              </span>
              <div className="action-btns">
                <button className="edit-btn" onClick={() => setEditItem(item)}>
                  Edit
                </button>
                <button className="remove-btn" onClick={() => removeFood(item._id, item.name)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default List
