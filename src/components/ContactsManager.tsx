import React, { useState } from 'react';
import { Phone, MessageCircle, UserPlus, Trash2, Star, User, ShieldCheck, DownloadCloud, Search } from 'lucide-react';
import { Contact } from '../types/jarvis';
import { deviceController } from '../utils/deviceController';
import { soundFX } from '../utils/soundEffects';

interface ContactsManagerProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onSelectCall: (contact: Contact) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onSelectCall,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneType, setPhoneType] = useState<'mobile' | 'work' | 'home'>('mobile');
  const [relation, setRelation] = useState('Personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    soundFX.playActionSuccess();
    onAddContact({
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      phoneType,
      relation: relation.trim(),
      favorite: true,
    });

    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleImportNativeContacts = async () => {
    soundFX.playActivation();
    try {
      const imported = await deviceController.pickPhoneContacts();
      if (imported && imported.length > 0) {
        soundFX.playActionSuccess();
        imported.forEach((c, idx) => {
          onAddContact({
            id: (Date.now() + idx).toString(),
            name: c.name,
            phone: c.phone,
            phoneType: 'mobile',
            relation: 'Imported',
            favorite: true,
          });
        });
        setImportStatus(`Successfully synced ${imported.length} contact(s) from your phone!`);
      } else {
        setImportStatus('Contacts picker cancelled or unsupported in current browser.');
      }
    } catch {
      setImportStatus('Could not access device contacts. You can add them manually or via voice.');
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleCall = (c: Contact) => {
    soundFX.playActivation();
    // Safety confirmation before initiating call
    onSelectCall(c);
  };

  const handleWhatsApp = (c: Contact) => {
    soundFX.playActionSuccess();
    deviceController.triggerWhatsApp(c.phone, 'Hello!');
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.relation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
                VOICE CONTACTS & DIALER MANAGEMENT
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                CONFIRMATION ENABLED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-chakra mt-0.5">
              Voice: &quot;<span className="text-cyan-300 font-semibold">Call Sarah mobile</span>&quot; or &quot;<span className="text-cyan-300 font-semibold">Call 123-456-7890</span>&quot; (Jarvis confirms before dialing).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportNativeContacts}
              className="flex items-center gap-1 bg-slate-950 border border-cyan-800 hover:border-cyan-400 text-cyan-300 px-2.5 py-1.5 rounded-lg text-xs font-chakra font-semibold transition-all shrink-0"
              title="Import contacts using Android native Contacts API"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYNC PHONE</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-700 hover:border-cyan-400 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-chakra font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              {showAddForm ? 'CANCEL' : 'ADD CONTACT'}
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded px-2.5 py-1">
            {importStatus}
          </div>
        )}

        {/* Quick Search */}
        <div className="mt-3 pt-3 border-t border-cyan-900/30">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts by name, number, or relation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-cyan-900/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Add Contact Modal / Collapsible Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-cyan-900/40 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Name (e.g. Sarah, Mom)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              required
            />
            <input
              type="tel"
              placeholder="Phone (123-456-7890)..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              required
            />
            <select
              value={phoneType}
              onChange={(e) => setPhoneType(e.target.value as any)}
              className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2 py-1.5 text-xs text-cyan-200 focus:outline-none"
            >
              <option value="mobile">Mobile</option>
              <option value="work">Work</option>
              <option value="home">Home</option>
            </select>
            <div className="flex gap-2">
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2 py-1.5 text-xs text-cyan-200 focus:outline-none flex-1"
              >
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
                <option value="Work">Work</option>
                <option value="Emergency">Emergency</option>
              </select>
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg font-chakra text-xs"
              >
                SAVE
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500 font-mono">
            No contacts found. Use &quot;ADD CONTACT&quot;, tap &quot;SYNC PHONE&quot; to import from Android, or say &quot;Call Sarah mobile&quot;!
          </div>
        ) : (
          filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-slate-900/60 border border-cyan-900/40 hover:border-cyan-600/70 rounded-xl p-3 flex items-center justify-between transition-all group backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center font-orbitron font-bold text-xs text-cyan-300">
                {contact.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-chakra font-bold text-sm text-slate-100">{contact.name}</h4>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                    {contact.phoneType || 'mobile'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {contact.relation}
                  </span>
                </div>
                <p className="text-xs font-mono text-cyan-300/80 mt-0.5">{contact.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* WhatsApp Action */}
              <button
                onClick={() => handleWhatsApp(contact)}
                className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-700/60 hover:bg-emerald-900/80 text-emerald-300 transition-colors"
                title={`WhatsApp ${contact.name}`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* Safe Call Action */}
              <button
                onClick={() => handleCall(contact)}
                className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-700/60 hover:bg-cyan-900/80 text-cyan-300 transition-colors"
                title={`Safe Call ${contact.name}`}
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => onDeleteContact(contact.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove contact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
