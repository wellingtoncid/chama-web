import { useState } from 'react';
import { Calculator, Truck, MapPin, DollarSign, Wrench, Fuel, BadgePercent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFields {
  vehicleValue: number;
  monthlyTrips: number;
  consumption: number;
  dieselPrice: number;
  distance: number;
  tireQty: number;
  tirePrice: number;
  toll: number;
  dailyRate: number;
  meals: number;
  profitMargin: number;
}

interface CostResult {
  fuelCost: number;
  tireCost: number;
  depreciation: number;
  maintenance: number;
  operationalTotal: number;
  operationalPerKm: number;
  tripExpenses: number;
  totalCost: number;
  suggestedPrice: number;
}

const TIRE_LIFESPAN_KM = 120000;
const USEFUL_LIFE_MONTHS = 60;
const ANNUAL_MAINTENANCE_PCT = 0.10;

function calculate(form: FormFields): CostResult | null {
  if (!form.distance || !form.consumption || !form.dieselPrice) return null;

  const fuelCost = (form.distance / form.consumption) * form.dieselPrice;
  const tireCost = form.tireQty && form.tirePrice
    ? (form.tireQty * form.tirePrice) * (form.distance / TIRE_LIFESPAN_KM)
    : 0;
  const usefulLifeTrips = form.monthlyTrips * USEFUL_LIFE_MONTHS;
  const depreciation = form.vehicleValue && usefulLifeTrips > 0
    ? form.vehicleValue / usefulLifeTrips
    : 0;
  const maintenance = form.vehicleValue && form.monthlyTrips > 0
    ? (form.vehicleValue * ANNUAL_MAINTENANCE_PCT / 12) / form.monthlyTrips
    : 0;
  const operationalTotal = fuelCost + tireCost + depreciation + maintenance;
  const operationalPerKm = operationalTotal / form.distance;
  const tripExpenses = form.toll + form.dailyRate + form.meals;
  const totalCost = operationalTotal + tripExpenses;
  const suggestedPrice = totalCost * (1 + form.profitMargin / 100);

  return { fuelCost, tireCost, depreciation, maintenance, operationalTotal, operationalPerKm, tripExpenses, totalCost, suggestedPrice };
}

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function CostCalculator({ className }: { className?: string }) {
  const [form, setForm] = useState<FormFields>({
    vehicleValue: 250000, monthlyTrips: 4, consumption: 3.5, dieselPrice: 6.20,
    distance: 1200, tireQty: 6, tirePrice: 2500,
    toll: 350, dailyRate: 250, meals: 80, profitMargin: 15,
  });

  const upd = (f: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: parseFloat(e.target.value) || 0 }));

  const result = calculate(form);

  const Inp = ({ label, field, prefix, suffix }: { label: string; field: keyof FormFields; prefix?: string; suffix?: string }) => (
    <div>
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{prefix}</span>}
        <input type="number" value={form[field] || ''} onChange={upd(field)}
          className={cn(
            "w-full h-12 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-sm outline-none transition-all px-4",
            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20", prefix && "pl-8", suffix && "pr-10"
          )}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="p-5 lg:p-7 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500"><Calculator size={22} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Calculadora de Custo Operacional</h1>
            <p className="text-xs text-slate-400 font-medium">Descubra se vale a pena aceitar o frete</p>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-7 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Truck size={14} /> Dados do Veículo
            </h3>
            <Inp label="Valor do Veículo (R$)" field="vehicleValue" prefix="R$" />
            <Inp label="Viagens por Mês" field="monthlyTrips" />
            <Inp label="Consumo (km/L)" field="consumption" suffix="km/L" />
            <Inp label="Valor do Diesel (R$/L)" field="dieselPrice" prefix="R$" suffix="/L" />
            <Inp label="Quantidade de Pneus" field="tireQty" />
            <Inp label="Valor de Cada Pneu (R$)" field="tirePrice" prefix="R$" />
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <MapPin size={14} /> Dados da Viagem
            </h3>
            <Inp label="Distância Total (km)" field="distance" suffix="km" />
            <Inp label="Pedágio (R$)" field="toll" prefix="R$" />
            <Inp label="Diária do Motorista (R$)" field="dailyRate" prefix="R$" />
            <Inp label="Alimentação (R$)" field="meals" prefix="R$" />
            <Inp label="Margem de Lucro (%)" field="profitMargin" suffix="%" />
          </div>
        </div>

        {result && (
          <>
            <div className="bg-slate-50 rounded-2xl p-5 lg:p-6 space-y-4">
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <DollarSign size={14} /> Resultado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResCard label="Custo Operacional" value={result.operationalTotal} sub={`R$ ${result.operationalPerKm.toFixed(2)}/km`} icon={<Wrench size={16} />} />
                <ResCard label="Despesas da Viagem" value={result.tripExpenses} sub="pedágio + diária + alimentação" icon={<Fuel size={16} />} />
                <ResCard label="Custo Total" value={result.totalCost} sub="operacional + despesas" icon={<DollarSign size={16} />} highlight />
                <ResCard label="Preço Sugerido" value={result.suggestedPrice} sub={`+${form.profitMargin}% de lucro`} icon={<BadgePercent size={16} />} highlight />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Detalhamento</h4>
              <div className="space-y-2">
                <BarRow label="Combustível" value={result.fuelCost} total={result.operationalTotal} color="bg-orange-400" />
                <BarRow label="Pneus" value={result.tireCost} total={result.operationalTotal} color="bg-blue-400" />
                <BarRow label="Depreciação" value={result.depreciation} total={result.operationalTotal} color="bg-purple-400" />
                <BarRow label="Manutenção" value={result.maintenance} total={result.operationalTotal} color="bg-emerald-400" />
              </div>
            </div>
          </>
        )}

        {!result && (
          <div className="bg-amber-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-amber-700 font-bold">Preencha distância, consumo e valor do diesel para ver o resultado.</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border-t border-amber-100 p-4 lg:p-5">
        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
          <strong>Importante:</strong> Esta é uma estimativa de custo operacional baseada nos dados informados.
          Consulte sempre a tabela de pisos mínimos da ANTT para referência oficial.
        </p>
      </div>
    </div>
  );
}

function ResCard({ label, value, sub, icon, highlight }: { label: string; value: number; sub: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl p-4", highlight ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white border border-slate-200")}>
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(highlight ? "text-white/80" : "text-slate-400")}>{icon}</span>
        <span className={cn("text-[9px] font-black uppercase tracking-wider", highlight ? "text-white/80" : "text-slate-400")}>{label}</span>
      </div>
      <p className={cn("text-xl font-black", highlight ? "text-white" : "text-slate-900")}>{fmt(value)}</p>
      <p className={cn("text-[10px] font-medium mt-0.5", highlight ? "text-white/70" : "text-slate-400")}>{sub}</p>
    </div>
  );
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-slate-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 w-22 text-right">{fmt(value)}</span>
      <span className="text-[9px] text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}
