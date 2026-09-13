import React, { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import './Add.css'

const categories = [
  'Paranthas',
  'Breakfast',
  'Rice Combo',
  'Thali',
  'Rolls',
  'Salad',
  'Sandwich',
  'Deserts',
  'Drinks',
  'Other'
]

const Add = () => {
  const [image, setImage] = useState(null)
  const [data, setData] = useState({ name: '', description: '', price: '', category: 'Paranthas' })
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)

  const onChange = e => setData({ ...data, [e.target.name]: e.target.value })

  const addVariant = () => setVariants([...variants, { size: 'Small', price: '' }])
  const updateVariant = (i, field, val) => {
    const updated = [...variants]
    updated[i][field] = val
    setVariants(updated)
  }
  const removeVariant = i => setVariants(variants.filter((_, idx) => idx !== i))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!image) { toast.error('Please upload an image'); return }

    // Filter out variants with empty price before sending
    const validVariants = variants.filter(v => v.price !== '' && !isNaN(Number(v.price)) && Number(v.price) > 0)

    setLoading(true)
    const formData = new FormData()
    formData.append('image', image)
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price)
    formData.append('category', data.category)
    if (validVariants.length > 0) {
      formData.append('variants', JSON.stringify(validVariants))
    }

    try {
      const res = await api.post('/api/food/add', formData)
      if (res.data.success) {
        toast.success('Food item added!')
        setData({ name: '', description: '', price: '', category: 'Paranthas' })
        setImage(null)
        setVariants([])
      } else {
        toast.error(res.data.message || 'Error adding food')
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="add-page">
      <h2>Add New Food Item</h2>
      <form onSubmit={onSubmit} className="add-form">
        <div className="add-image-section">
          <label className="img-upload-label" htmlFor="img-input">
            {image
              ? <img src={URL.createObjectURL(image)} alt="preview" />
              : <div className="img-placeholder">📷<p>Click to upload image</p></div>
            }
          </label>
          <input id="img-input" type="file" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
          {image && <p className="img-name">✅ {image.name}</p>}
        </div>

        <div className="add-fields">
          <label>Item Name
            <input name="name" value={data.name} onChange={onChange} placeholder="e.g. Aloo Parantha" required />
          </label>
          <label>Description
            <textarea name="description" value={data.description} onChange={onChange} rows={3} placeholder="Describe the dish..." required />
          </label>
          <div className="add-row">
            <label>Base Price (₹)
              <input name="price" type="number" min="1" value={data.price} onChange={onChange} placeholder="70" required />
            </label>
            <label>Category
              <select name="category" value={data.category} onChange={onChange}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="variants-section">
            <div className="variants-header">
              <div>
                <h4>Size Variants <span>(optional)</span></h4>
                <p>Add only if item comes in multiple sizes</p>
              </div>
              <button type="button" onClick={addVariant}>+ Add Size</button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="variant-row">
                <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                  <option>Half</option>
                  <option>Full</option>
                </select>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={v.price}
                  onChange={e => updateVariant(i, 'price', e.target.value)}
                  min="1"
                />
                <button type="button" onClick={() => removeVariant(i)} className="rm-variant">✕</button>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="no-variant-msg">No variants added — base price will be used</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="add-submit-btn">
            {loading ? 'Adding...' : 'Add Food Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Add
