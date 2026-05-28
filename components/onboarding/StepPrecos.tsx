'use client'
import { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Service = { tipo_servico: string; preco_base: number; custom?: boolean }

const DEFAULT_SERVICES: Service[] = [
  { tipo_servico: 'Banho', preco_base: 50 },
  { tipo_servico: 'Tosa', preco_base: 80 },
  { tipo_servico: 'Banho + Tosa', preco_base: 120 },
  { tipo_servico: 'Consulta Veterinária', preco_base: 150 },
]

export default function StepPrecos({ onNext }: { onNext: () => void }) {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updatePrice(index: number, value: string) {
    setServices(prev =>
      prev.map((s, i) => i === index ? { ...s, preco_base: parseFloat(value) || 0 } : s)
    )
  }

  function updateName(index: number, value: string) {
    setServices(prev =>
      prev.map((s, i) => i === index ? { ...s, tipo_servico: value } : s)
    )
  }

  function addService() {
    setServices(prev => [...prev, { tipo_servico: '', preco_base: 0, custom: true }])
  }

  function removeService(index: number) {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const invalid = services.find(s => !s.tipo_servico.trim())
    if (invalid) { setError('Preencha o nome de todos os serviços.'); return }

    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sessão expirada. Faça login novamente.'); setSaving(false); return }

    let { data: petshop } = await supabase
      .from('petshops')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!petshop) {
      const { data: newPetshop, error: insertErr } = await supabase
        .from('petshops')
        .insert({ owner_id: user.id, nome: 'Meu Petshop' })
        .select('id')
        .single()

      if (insertErr || !newPetshop) {
        setError('Erro ao criar o petshop. Tente novamente.')
        setSaving(false)
        return
      }
      petshop = newPetshop
    }

    await supabase.from('servicos_catalogo').delete().eq('petshop_id', petshop!.id)

    const { error: insertErr } = await supabase
      .from('servicos_catalogo')
      .insert(services.map(({ tipo_servico, preco_base }) => ({ tipo_servico, preco_base, petshop_id: petshop!.id })))

    if (insertErr) {
      setError('Erro ao salvar preços. Tente novamente.')
      setSaving(false)
      return
    }

    setSaving(false)
    onNext()
  }

  return (
    <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shadow-sm">
          <Tag className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-extrabold tracking-tight">Tabela de Preços</CardTitle>
        <CardDescription className="dark:text-slate-400 font-medium text-xs">
          Defina os preços base dos seus serviços para a Lara IA consultar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-800">
          {services.map((service, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-xl transition-all hover:border-indigo-500/20"
            >
              {service.custom ? (
                <Input
                  placeholder="Ex: Hidratação Ozonizada"
                  value={service.tipo_servico}
                  onChange={e => updateName(i, e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-xs font-semibold h-9 rounded-lg"
                />
              ) : (
                <span className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-250 px-1">
                  {service.tipo_servico}
                </span>
              )}
              
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">R$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={service.preco_base}
                  onChange={e => updatePrice(i, e.target.value)}
                  className="w-20 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-xs font-black h-9 rounded-lg text-center"
                />
              </div>

              {service.custom && (
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addService}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold pt-1 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar serviço customizado
        </button>

        {error && <p className="text-xs font-semibold text-rose-550 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-250/20">{error}</p>}

        <Button 
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 hover:opacity-90 font-bold transition-all text-white py-5 shadow-lg shadow-indigo-500/10 cursor-pointer" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? 'Gravando Catálogo...' : 'Salvar e Acessar Plataforma'}
        </Button>
      </CardContent>
    </Card>
  )
}
