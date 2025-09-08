import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteJewelry, addJewelry, updateJewelry } from '../features/jewelry/jewelrySlice';
import CONSTS, { JEWELRY, UI, VALIDATION } from '../constants/const';

export default function JewelryList() {
  const items = useSelector(s => s.jewelry.items || []);
  const auth = useSelector(s => s.auth);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', karat: '', value: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleStartAdd = () => { setEditing('new'); setForm({ name: '', karat: '', value: '' }); };
  const handleStartEdit = (id) => {
    const item = items.find(it => String(it.id) === String(id));
    if (!item) return;
    setEditing(item.id);
    setForm({ name: item.name, karat: item.karat, value: item.value });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // inline validation for fields
    if (name === 'name') setErrors(prev => ({ ...prev, name: value.trim() ? null : VALIDATION.NAME_REQUIRED }));
    if (name === 'karat') setErrors(prev => ({ ...prev, karat: value.trim() ? null : 'Karat is required' }));
    if (name === 'value') setErrors(prev => ({ ...prev, value: value.trim() ? null : 'Value is required' }));
  };

  const handleCancel = () => setEditing(null);

  const handleDelete = (id) => {
    const userId = auth?.user?.id;
    dispatch(deleteJewelry({ id, userId }));
  };

  const handleSubmit = () => {
    const userId = auth && auth.user && auth.user.id;
  const errs = {};
    if (!form.name || !form.name.trim()) errs.name = VALIDATION.NAME_REQUIRED;
    if (!form.karat || !form.karat.trim()) errs.karat = 'Karat is required';
    if (!form.value || !form.value.trim()) errs.value = 'Value is required';
  setErrors(errs);
  if (Object.keys(errs).length) return;
    if (editing === 'new') dispatch(addJewelry({ userId, data: form }));
    else dispatch(updateJewelry({ id: editing, data: form, userId }));
    setEditing(null);
  };

  return (
    <div>
    <div className="flex-between mb-3">
  <strong>{UI.TITLES.YOUR_ITEMS}</strong>
  <button className="primary-small" onClick={handleStartAdd}>{JEWELRY.ACTIONS.ADD}</button>
    </div>

      <div className="jewelry-grid">
        {items.map(i => (
          <div className="j-card" key={i.id}>
            {editing === i.id ? (
              <div>
                <input name="name" value={form.name} onChange={handleFormChange} />
                {errors.name && <div className="field-error">{errors.name}</div>}
                <input name="karat" value={form.karat} onChange={handleFormChange} />
                {errors.karat && <div className="field-error">{errors.karat}</div>}
                <input name="value" value={form.value} onChange={handleFormChange} />
                {errors.value && <div className="field-error">{errors.value}</div>}
                <div className="actions"><button onClick={handleSubmit}>{JEWELRY.ACTIONS.SAVE}</button><button onClick={handleCancel}>{JEWELRY.ACTIONS.CANCEL}</button></div>
              </div>
            ) : (
              <>
                <h5>{i.name}</h5>
                <div className="meta">{i.karat} • {i.value}</div>
                <div className="actions">
                  <button data-id={i.id} onClick={(e) => handleStartEdit(e.currentTarget.dataset.id)}>{JEWELRY.ACTIONS.EDIT}</button>
                  <button data-id={i.id} onClick={(e) => handleDelete(Number(e.currentTarget.dataset.id))}>{JEWELRY.ACTIONS.DELETE}</button>
                </div>
              </>
            )}
          </div>
        ))}

        {editing === 'new' && (
          <div className="j-card">
            <input name="name" placeholder={JEWELRY.PLACEHOLDERS.NAME} value={form.name} onChange={handleFormChange} />
            {errors.name && <div className="field-error">{errors.name}</div>}
            <input name="karat" placeholder={JEWELRY.PLACEHOLDERS.KARAT} value={form.karat} onChange={handleFormChange} />
            {errors.karat && <div className="field-error">{errors.karat}</div>}
            <input name="value" placeholder={JEWELRY.PLACEHOLDERS.VALUE} value={form.value} onChange={handleFormChange} />
            {errors.value && <div className="field-error">{errors.value}</div>}
            <div className="actions"><button onClick={handleSubmit}>{JEWELRY.ACTIONS.ADD_BUTTON}</button><button onClick={handleCancel}>{JEWELRY.ACTIONS.CANCEL}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
