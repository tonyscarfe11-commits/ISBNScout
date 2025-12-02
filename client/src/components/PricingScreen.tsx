import React from "react";

const PricingScreen = () => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Upgrade Your Account</h1>

      <div className="space-y-6">

        <div className="bg-slate-900/60 p-5 rounded-xl border border-emerald-500">
          <h2 className="text-xl font-semibold mb-1">Pro</h2>
          <p className="text-sm mb-3 text-slate-300">£14.99/month or £149/year</p>
          <ul className="text-sm text-slate-400 mb-3 space-y-1">
            <li>• Unlimited scans</li>
            <li>• Offline mode</li>
            <li>• Barcode, cover & AI spine recognition</li>
            <li>• Amazon + eBay UK profit calculator</li>
            <li>• Postage estimates</li>
            <li>• Scan history</li>
          </ul>
          <button className="w-full bg-emerald-400 text-black py-2 rounded-full font-semibold">
            Start 14-Day Pro Trial
          </button>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-600">
          <h2 className="text-xl font-semibold mb-1">Elite</h2>
          <p className="text-sm mb-3 text-slate-300">£19.99/month or £199/year</p>
          <ul className="text-sm text-slate-400 mb-3 space-y-1">
            <li>• Everything in Pro</li>
            <li>• Buy / Don't Buy triggers</li>
            <li>• Custom profit rules</li>
            <li>• CSV export</li>
            <li>• Multi-device access</li>
          </ul>
          <button className="w-full bg-white text-black py-2 rounded-full font-semibold">
            Start 14-Day Elite Trial
          </button>
        </div>

      </div>
    </div>
  );
};

export default PricingScreen;
