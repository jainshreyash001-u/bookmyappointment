import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, AlignLeft, CheckCircle, Shield, X } from 'lucide-react';

const AppointmentForm = ({ appointment = null, onSave, onCancel }) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [service, setService] = useState('Consultation');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('pending_confirmation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const services = [
    'Consultation',
    'General Cleaning',
    'Root Canal Treatment',
    'Tooth Extraction',
    'Teeth Whitening',
    'Dental Crown / Bridge',
    'Orthodontic Checkup',
    'Pediatric Treatment'
  ];

  useEffect(() => {
    if (appointment) {
      setPatientName(appointment.patientName || '');
      setPatientPhone(appointment.patientPhone || '');
      setService(appointment.service || 'Consultation');
      setStatus(appointment.status || 'pending_confirmation');
      setNotes(appointment.notes || '');
      setDuration(appointment.duration || 30);
      
      if (appointment.dateTime) {
        // Format ISO string to yyyy-MM-ddThh:mm format expected by datetime-local input
        const dateObj = new Date(appointment.dateTime);
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
        setDateTime(localISOTime);
      }
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !dateTime) {
      setErrorMsg('Please fill in all required fields (Name, Phone, and Date/Time).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const url = appointment 
        ? `${API_BASE}/api/appointments/${appointment.id}` 
        : `${API_BASE}/api/appointments`;
      
      const method = appointment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName,
          patientPhone,
          service,
          dateTime: new Date(dateTime).toISOString(),
          duration: Number(duration),
          status,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data.appointment);
      } else {
        throw new Error(data.error || 'Failed to save appointment');
      }
    } catch (err) {
      console.error('[Appointment Form Error]', err);
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-xl w-full">
      {/* Form Header */}
      <div className="bg-[#0a2540] p-6 text-white flex items-center justify-between border-b border-gray-800">
        <div>
          <h3 className="text-lg font-black tracking-wide uppercase">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {appointment ? 'Modify details or reschedule patient' : 'Add manual schedule entry'}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 font-sans">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        {/* Patient Name */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Shreyash Jain"
              className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Patient Phone */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
            WhatsApp Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              required
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="e.g. +919876543210"
              className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
              Select Dental Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
            >
              {services.map((srv, idx) => (
                <option key={idx} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
            >
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date & Time */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
              Date & Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="10"
                max="240"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-700 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
            Internal Staff Notes (Optional)
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient requested Dr. Singhal. Needs local anesthesia."
              className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="clinical-btn-secondary px-5 py-3 text-xs tracking-wider uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="clinical-btn-accent px-6 py-3 text-xs tracking-wider uppercase flex items-center gap-2"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
