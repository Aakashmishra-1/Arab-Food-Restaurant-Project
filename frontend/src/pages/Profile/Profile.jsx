import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './Profile.css'

const Profile = () => {
  const { url, token, userProfile, setUserProfile, fetchProfile } = useContext(StoreContext)
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [addrForm, setAddrForm] = useState({ label: 'Home', firstName: '', lastName: '', street: '', city: '', state: '', pincode: '', landmark: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userProfile) setForm({ name: userProfile.name || '', phone: userProfile.phone || '' })
  }, [userProfile])

  const saveProfile = async () => {
    setSaving(true)
    const res = await axios.post(url + '/api/user/profile/update', form, { headers: { token } })
    if (res.data.success) { toast.success('Profile updated'); await fetchProfile(token) }
    else toast.error(res.data.message)
    setSaving(false)
  }

  const saveAddress = async () => {
    const res = await axios.post(url + '/api/user/address/add', { address: addrForm }, { headers: { token } })
    if (res.data.success) { toast.success('Address saved'); await fetchProfile(token); setAddrForm({ label: 'Home', firstName: '', lastName: '', street: '', city: '', state: '', pincode: '', landmark: '', phone: '' }) }
    else toast.error(res.data.message)
  }

  const deleteAddress = async (addrId) => {
    const res = await axios.post(url + '/api/user/address/delete', { addressId: addrId }, { headers: { token } })
    if (res.data.success) { toast.success('Address removed'); await fetchProfile(token) }
  }

  if (!token) return <div className="profile-page"><p style={{textAlign:'center', padding:'80px', color:'#888'}}>Please sign in</p></div>

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <div className="profile-tabs">
        <button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>Personal Info</button>
        <button className={tab === 'address' ? 'active' : ''} onClick={() => setTab('address')}>Saved Addresses</button>
      </div>

      {tab === 'info' && (
        <div className="profile-card">
          <div className="profile-avatar">{(userProfile?.name || 'U').charAt(0).toUpperCase()}</div>
          <div className="profile-form">
            <label>Full Name
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </label>
            <label>Email
              <input value={userProfile?.email || ''} disabled placeholder="Email" />
            </label>
            <label>Phone
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </label>
            <button onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {tab === 'address' && (
        <div className="addresses-section">
          <h3>Saved Addresses</h3>
          {userProfile?.savedAddresses?.length > 0 ? (
            <div className="addr-list">
              {userProfile.savedAddresses.map(addr => (
                <div key={addr._id} className="addr-card">
                  <div>
                    <b>{addr.label}</b>
                    <p>{addr.firstName} {addr.lastName}</p>
                    <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.landmark && <p>Near: {addr.landmark}</p>}
                    <p>📞 {addr.phone}</p>
                  </div>
                  <button className="del-addr-btn" onClick={() => deleteAddress(addr._id)}>🗑 Remove</button>
                </div>
              ))}
            </div>
          ) : <p className="no-addr">No saved addresses yet</p>}

          <h3 style={{ marginTop: '28px' }}>Add New Address</h3>
          <div className="addr-form">
            <select value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })}>
              <option>Home</option><option>Work</option><option>Other</option>
            </select>
            <div className="form-row2">
              <input placeholder="First Name" value={addrForm.firstName} onChange={e => setAddrForm({ ...addrForm, firstName: e.target.value })} />
              <input placeholder="Last Name" value={addrForm.lastName} onChange={e => setAddrForm({ ...addrForm, lastName: e.target.value })} />
            </div>
            <input placeholder="Street / House No." value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} />
            <div className="form-row2">
              <input placeholder="City" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} />
              <input placeholder="State" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} />
            </div>
            <div className="form-row2">
              <input placeholder="Pincode" value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })} />
              <input placeholder="Landmark" value={addrForm.landmark} onChange={e => setAddrForm({ ...addrForm, landmark: e.target.value })} />
            </div>
            <input placeholder="Phone" value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} />
            <button onClick={saveAddress}>Save Address</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
