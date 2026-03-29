import { useState } from 'react';

export function BulkCalculator() {
  const [tubes, setTubes] = useState(10);
  const discount = tubes >= 50 ? 0.15 : tubes >= 20 ? 0.1 : 0;

  return (
    <div className="bg-zinc-950 border border-zinc-900 p-8 mt-20">
      <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-6">
        Bulk Order Estimator
      </h3>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 w-full">
          <label className="block text-zinc-500 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
            Quantity (Tubes)
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={tubes}
            onChange={(e) => setTubes(parseInt(e.target.value, 10))}
            className="w-full accent-[#E10600] bg-zinc-900 h-1 appearance-none cursor-pointer transition-all duration-300 ease-out"
          />
          <div className="flex justify-between mt-4 text-white font-bold text-xl uppercase tracking-tighter italic">
            <span>{tubes} Tubes</span>
            <span className="text-[#E10600]">{Math.round(discount * 100)}% OFF</span>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 flex flex-col items-center justify-center min-w-[200px]">
          <span className="text-zinc-500 text-[10px] font-black uppercase mb-1">Estimated Total</span>
          <span className="text-white text-3xl font-black italic">
            ₹{Math.round(tubes * 2000 * (1 - discount))}
          </span>
        </div>
      </div>
    </div>
  );
}
