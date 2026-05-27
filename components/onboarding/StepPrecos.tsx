'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
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
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Preços</CardTitle>
        <CardDescription>Defina os preços base dos seus serviços</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((service, i) => (
          <div key={i} className="flex items-center gap-2">
            {service.custom ? (
              <Input
                placeholder="Nome do serviço"
                value={service.tipo_servico}
                onChange={e => updateName(i, e.target.value)}
                className="flex-1"
              />
            ) : (
              <span className="flex-1 text-sm font-medium text-gray-700">
                {service.tipo_servico}
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm text-gray-500">R$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={service.preco_base}
                onChange={e => updatePrice(i, e.target.value)}
                className="w-24"
              />
            </div>
            {service.custom && (
              <button
                type="button"
                onClick={() => removeService(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addService}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium pt-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar serviço
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar e Continuar'}
        </Button>
      </CardContent>
    </Card>
  )
}
