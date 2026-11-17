'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X, Pencil, SlidersHorizontal } from 'lucide-react';
import { AttributeGroup, AttributeGroupType, AttributeValue } from '@/lib/types';
import { AttributeSwatch } from '@/components/store/AttributeSwatch';

const TYPE_LABEL: Record<AttributeGroupType, string> = {
  select: 'Desplegable',
  radio: 'Botones',
  color: 'Muestra de color',
};

const inputCls =
  'px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(res.status === 401 ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.' : data.error || 'No se pudo completar la acción.');
  }
  return data;
}

function ValueRow({
  value,
  isColor,
  onSaved,
  onDeleted,
  onError,
}: {
  value: AttributeValue;
  isColor: boolean;
  onSaved: (v: AttributeValue) => void;
  onDeleted: (id: string) => void;
  onError: (m: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(value.name);
  const [hex, setHex] = useState(value.hex || '#C2694F');
  const [multi, setMulti] = useState(value.isMulticolor);

  const save = async () => {
    try {
      const v = await api(`/api/attribute-values/${value.id}`, 'PUT', {
        name,
        hex: isColor && !multi ? hex : null,
        isMulticolor: isColor && multi,
      });
      onSaved(v);
      setEditing(false);
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar el valor "${value.name}"?`)) return;
    try {
      await api(`/api/attribute-values/${value.id}`, 'DELETE');
      onDeleted(value.id);
    } catch (e) {
      onError((e as Error).message);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 py-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} w-40`} />
        {isColor && (
          <>
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} disabled={multi} className="w-9 h-8 rounded border border-boho-sand-300" />
            <label className="flex items-center space-x-1 text-xs">
              <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} />
              <span>Multicolor</span>
            </label>
          </>
        )}
        <button onClick={save} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700" title="Guardar">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-boho-sand-100 text-boho-charcoal-muted" title="Cancelar">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2.5 text-xs font-medium text-boho-charcoal">
        {isColor && <AttributeSwatch hex={value.hex} isMulticolor={value.isMulticolor} size={20} />}
        <span>{value.name}</span>
        {isColor && value.isMulticolor && <span className="text-[10px] text-boho-charcoal-muted">(multicolor)</span>}
      </div>
      <div className="space-x-1">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-boho-sand-100 text-boho-charcoal" title="Editar">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={remove} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Eliminar">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  onChange,
  onDeleted,
  onError,
}: {
  group: AttributeGroup;
  onChange: (g: AttributeGroup) => void;
  onDeleted: (id: string) => void;
  onError: (m: string) => void;
}) {
  const [name, setName] = useState(group.name);
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#C2694F');
  const [newMulti, setNewMulti] = useState(false);
  const isColor = group.type === 'color';

  const saveGroup = async (patch: Partial<Pick<AttributeGroup, 'name' | 'type'>>) => {
    try {
      const g = await api(`/api/attributes/${group.id}`, 'PUT', patch);
      onChange(g);
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const removeGroup = async () => {
    if (!confirm(`¿Eliminar el grupo "${group.name}" y todos sus valores?`)) return;
    try {
      await api(`/api/attributes/${group.id}`, 'DELETE');
      onDeleted(group.id);
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const addValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const v = await api(`/api/attributes/${group.id}/values`, 'POST', {
        name: newName,
        hex: isColor && !newMulti ? newHex : null,
        isMulticolor: isColor && newMulti,
        sortOrder: group.values.length,
      });
      onChange({ ...group, values: [...group.values, v] });
      setNewName('');
      setNewMulti(false);
    } catch (err) {
      onError((err as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name !== group.name && saveGroup({ name })}
            className={`${inputCls} font-bold w-44`}
            aria-label="Nombre del grupo"
          />
          <select
            value={group.type}
            onChange={(e) => saveGroup({ type: e.target.value as AttributeGroupType })}
            className={inputCls}
            aria-label="Tipo de selector"
          >
            {(Object.keys(TYPE_LABEL) as AttributeGroupType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <button onClick={removeGroup} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Eliminar grupo">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-boho-sand-100">
        {group.values.length === 0 && <p className="text-xs text-boho-charcoal-muted py-2">Sin valores todavía.</p>}
        {group.values.map((v) => (
          <ValueRow
            key={v.id}
            value={v}
            isColor={isColor}
            onSaved={(nv) => onChange({ ...group, values: group.values.map((x) => (x.id === nv.id ? nv : x)) })}
            onDeleted={(id) => onChange({ ...group, values: group.values.filter((x) => x.id !== id) })}
            onError={onError}
          />
        ))}
      </div>

      <form onSubmit={addValue} className="flex flex-wrap items-center gap-2 pt-3 border-t border-boho-sand-100">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={isColor ? 'Ej. Terracota' : 'Ej. Arco'}
          className={`${inputCls} w-44`}
        />
        {isColor && (
          <>
            <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} disabled={newMulti} className="w-9 h-8 rounded border border-boho-sand-300" aria-label="Color" />
            <label className="flex items-center space-x-1 text-xs">
              <input type="checkbox" checked={newMulti} onChange={(e) => setNewMulti(e.target.checked)} />
              <span>Multicolor</span>
            </label>
          </>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir valor</span>
        </button>
      </form>
    </div>
  );
}

export default function AdminAttributesPage() {
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AttributeGroupType>('select');

  useEffect(() => {
    api('/api/attributes', 'GET')
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const g = await api('/api/attributes', 'POST', { name: newName, type: newType, sortOrder: groups.length });
      setGroups((prev) => [...prev, g]);
      setNewName('');
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">Variantes de producto</span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal flex items-center space-x-2">
          <SlidersHorizontal className="w-6 h-6 text-boho-terracotta" />
          <span>Atributos (Modelo, Color, Talla…)</span>
        </h1>
        <p className="text-xs text-boho-charcoal-muted mt-1">
          Define aquí los grupos y sus valores. Después, en cada producto, genera las combinaciones con precio, stock y SKU propios.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
          {error}
        </p>
      )}

      <form onSubmit={addGroup} className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft flex flex-wrap items-center gap-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nuevo grupo (Ej. Color)" className={`${inputCls} w-56`} />
        <select value={newType} onChange={(e) => setNewType(e.target.value as AttributeGroupType)} className={inputCls}>
          {(Object.keys(TYPE_LABEL) as AttributeGroupType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Crear grupo</span>
        </button>
      </form>

      {loading ? (
        <p className="text-xs text-boho-charcoal-muted">Cargando…</p>
      ) : groups.length === 0 ? (
        <p className="text-xs text-boho-charcoal-muted">Todavía no hay grupos de atributos.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onChange={(ng) => setGroups((prev) => prev.map((x) => (x.id === ng.id ? ng : x)))}
              onDeleted={(id) => setGroups((prev) => prev.filter((x) => x.id !== id))}
              onError={setError}
            />
          ))}
        </div>
      )}
    </div>
  );
}
