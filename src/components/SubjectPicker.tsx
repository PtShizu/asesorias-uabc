'use client'

import { useState, useMemo, useEffect } from 'react'
import { Subject, Career } from '@/types/database'

interface SubjectPickerProps {
  allSubjects: Subject[]
  careers: Career[]
  selectedSubjectIds: string[]
}

export default function SubjectPicker({ allSubjects, careers, selectedSubjectIds }: SubjectPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSubjectIds))
  const [search, setSearch] = useState('')
  const [selectedCareer, setSelectedCareer] = useState<string>('all')

  // Filtrado de materias
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(search.toLowerCase())
      const matchesCareer = selectedCareer === 'all' || 
                           (subject.career_ids && subject.career_ids.includes(selectedCareer))
      return matchesSearch && matchesCareer
    })
  }, [allSubjects, search, selectedCareer])

  const toggleSubject = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar materia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filtro por Carrera */}
        <select
          value={selectedCareer}
          onChange={(e) => setSelectedCareer(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
        >
          <option value="all">Todas las carreras</option>
          {careers.map(career => (
            <option key={career.id} value={career.id}>{career.name}</option>
          ))}
        </select>
      </div>

      {/* Contador de seleccionadas */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Materias encontradas: {filteredSubjects.length}
        </p>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Seleccionadas: {selected.size}
        </p>
      </div>

      {/* Lista de Materias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {filteredSubjects.length === 0 && (
          <p className="col-span-full text-center py-10 text-sm text-zinc-500 italic border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
            No se encontraron materias con esos filtros.
          </p>
        )}
        {filteredSubjects.map(subject => {
          const isSelected = selected.has(subject.id)
          return (
            <div 
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'}
              `}
            >
              <div className={`
                h-5 w-5 rounded border flex items-center justify-center transition-colors
                ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'}
              `}>
                {isSelected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {subject.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* 
        Inputs ocultos para que el FormAction reciba todas las materias seleccionadas, 
        incluso las que no están visibles por el filtro actual.
      */}
      {Array.from(selected).map(id => (
        <input key={id} type="hidden" name="subjects" value={id} />
      ))}
    </div>
  )
}
