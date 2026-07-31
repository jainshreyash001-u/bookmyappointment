import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldAlert, CreditCard, Sparkles, Lock } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState('Growth');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const plans = {
    Starter: {
      name: 'Starter Plan',
      price: 1999,
      calls: '500 AI mins/mo',
      features: ['WhatsApp text booking', 'Google Calendar integration', 'Basic analytics', '1 clinic seat']
    },
    Growth: {
      name: 'Growth Plan',
      price: 4999,
      calls: '1,500 AI mins/mo',
      features: ['WhatsApp text & voice booking', 'Google Calendar integration', 'Custom dental FAQs RAG index', 'AI regional language support', 'Up to 3 clinic seats']
    },
    Enterprise: {
      name: 'Enterprise Plan',
      price: 9999,
      calls: 'Unlimited AI mins/mo',
      features: ['Custom regional voice models', 'Dedicated clinic numbers', 'Custom database integrations', 'HIPAA compliant dashboard log auditing', '24/7 dedicated support']
    }
  };

  // Helper to load Razorpay SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setErrorMsg('');

    const resScript = await loadRazorpayScript();
    if (!resScript) {
      setErrorMsg('Failed to load payment gateway SDK. Check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const planDetails = plans[selectedPlan];

      // 1. Create Razorpay Order
      const resOrder = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: planDetails.price,
          currency: 'INR',
          plan: selectedPlan
        })
      });

      const dataOrder = await resOrder.json();
      if (!resOrder.ok || !dataOrder.success) {
        throw new Error(dataOrder.error || 'Failed to initialize order.');
      }

      const order = dataOrder.order;
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy';

      // 2. Open Razorpay payment dialog
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'BookMyAppointment SaaS',
        description: `Upgrade to ${planDetails.name}`,
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify Payment
          try {
            setLoading(true);
            const resVerify = await fetch(`${API_BASE}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan
              })
            });

            const dataVerify = await resVerify.json();
            if (resVerify.ok && dataVerify.success) {
              onSuccess(selectedPlan);
            } else {
              throw new Error(dataVerify.error || 'Signature verification failed.');
            }
          } catch (err) {
            setErrorMsg(err.message || 'Verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#0a2540'
        }
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();
    } catch (err) {
      console.error('[Payment Error]', err);
      setErrorMsg(err.message || 'Failed to initialize payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-gray-100 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row text-[#0a2540]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#0a2540] z-10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left side: Plan Selector */}
            <div className="flex-1 p-6 md:p-8 bg-white">
              <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase block mb-1">Upgrade Account</span>
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Choose Your Plan</h3>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                {Object.keys(plans).map((key) => {
                  const plan = plans[key];
                  const isSelected = selectedPlan === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                        isSelected
                          ? 'border-[#10b981] bg-[#10b981]/5 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase">{plan.name}</h4>
                          {key === 'Growth' && (
                            <span className="bg-[#10b981]/15 text-[#0d9668] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 block mt-1">{plan.calls}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black">₹{plan.price.toLocaleString('en-IN')}<span className="text-[10px] text-gray-400 font-bold">/mo</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-[#10b981]" />
                Secure Payments via Razorpay Core
              </div>
            </div>

            {/* Right side: Plan Summary Details */}
            <div className="w-full md:w-72 bg-[#f8fafc] border-t md:border-t-0 md:border-l border-gray-100 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Included Features</h4>
                <ul className="space-y-3 font-semibold text-xs text-gray-600">
                  {plans[selectedPlan].features.map((feat, index) => (
                    <li key={index} className="flex gap-2.5 items-start">
                      <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/60">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Total Due:</span>
                  <span className="text-2xl font-black">₹{plans[selectedPlan].price.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="clinical-btn-accent w-full py-4 text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
