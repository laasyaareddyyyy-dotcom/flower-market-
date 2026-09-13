import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  BookOpen,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Printer,
  ChevronRight,
  Plus,
  User,
  Sparkles,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Farmer } from '../../types';
import { flowerVarietiesData } from '../../translations';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';

export const FarmersView: React.FC = () => {
  const {
    farmers,
    addFarmer,
    updateFarmer,
    lots,
    getFarmerStats,
    setSelectedParchiLot,
    merchantProfile,
    setIsFarmerSignUpOpen,
    language,
    t,
  } = useMandi();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [selectedLedgerFarmer, setSelectedLedgerFarmer] = useState<Farmer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formCrops, setFormCrops] = useState<string[]>(['Marigold (Banthi)']);

  const filteredFarmers = farmers.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      f.primaryCrops.some((c) => c.toLowerCase().includes(q))
    );
  });

  const openAddModal = () => {
    setEditingFarmer(null);
    setFormName('');
    setFormPhone('');
    setFormVillage('');
    setFormPhotoUrl('');
    setFormCrops(['Marigold (Banthi)']);
    setIsAddModalOpen(true);
  };

  const openEditModal = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormName(farmer.name);
    setFormPhone(farmer.phone);
    setFormVillage(farmer.village);
    setFormPhotoUrl(farmer.photoUrl || '');
    setFormCrops(farmer.primaryCrops);
    setIsAddModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingFarmer) {
      updateFarmer(editingFarmer.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        village: formVillage.trim(),
        primaryCrops: formCrops,
        photoUrl: formPhotoUrl.trim() || undefined,
      });
    } else {
      addFarmer({
        name: formName.trim(),
        phone: formPhone.trim() || '9876543210',
        village: formVillage.trim() || 'Local Area',
        primaryCrops: formCrops.length > 0 ? formCrops : ['Marigold (Banthi)'],
        connectedMerchantIds: [merchantProfile.merchantId],
        photoUrl: formPhotoUrl.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleCrop = (cropName: string) => {
    if (formCrops.includes(cropName)) {
      setFormCrops(formCrops.filter((c) => c !== cropName));
    } else {
      setFormCrops([...formCrops, cropName]);
    }
  };

  // Farmer Ledger Modal calculations
  const farmerLots = selectedLedgerFarmer
    ? lots.filter((l) => l.farmerId === selectedLedgerFarmer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2E6349]" />
              <span>{t('farmersDirectoryTitle')}</span>
            </h2>
            <p className="text-xs text-[#6B5E57]">{t('farmersDirectorySubtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="open-farmer-signup-wizard-btn"
              onClick={() => setIsFarmerSignUpOpen(true)}
              className="px-3 py-2 rounded-xl border border-[#2E6349] text-[#2E6349] text-xs font-bold hover:bg-[#E9F3EE] transition flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#DD9F2F]" />
              <span>Sign Up Farmer (రైతు నమోదు)</span>
            </button>
            <button
              id="open-add-farmer-modal-btn"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-[#DD9F2F]" />
              <span>{t('addFarmerBtn')}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
          <input
            id="farmers-search-input"
            type="text"
            placeholder={t('searchFarmersPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
          />
        </div>
      </div>

      {/* Farmers Grid / Cards */}
      {filteredFarmers.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-[#E8E2D9] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-black text-base text-[#2A1F1A]">No Farmers Registered in Khata Yet</h4>
            <p className="text-xs text-[#6B5E57]">
              Start building your mandi grower directory. Registered farmers will have their passbooks and daily lots tracked automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition inline-flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-[#DD9F2F]" />
            <span>{t('addFarmerBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map((farmer) => {
            const stats = getFarmerStats(farmer.id);

            return (
              <div
                key={farmer.id}
                id={`farmer-card-${farmer.id}`}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition space-y-3.5 flex flex-col justify-between"
              >
                {/* Farmer Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0 shadow-2xs">
                        {farmer.photoUrl ? (
                          <img
                            src={farmer.photoUrl}
                            alt={farmer.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-sm">
                            {farmer.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm sm:text-base text-[#2A1F1A]">
                            {farmer.name}
                          </h4>
                          <span className="font-mono text-[10px] bg-[#FCFBF9] text-[#6B5E57] px-1.5 py-0.5 rounded border border-[#E8E2D9]">
                            {farmer.id}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5E57] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#2E6349]" />
                          <span>{farmer.village}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-[#2A1F1A] font-mono mt-1">
                          <Phone className="w-3 h-3 text-[#6B5E57]" />
                          <span>+91 {farmer.phone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`edit-farmer-btn-${farmer.id}`}
                      onClick={() => openEditModal(farmer)}
                      className="text-[11px] text-[#2E6349] font-semibold hover:underline shrink-0"
                    >
                      {t('editFarmer')}
                    </button>
                  </div>

                  {/* Primary Crops Chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {farmer.primaryCrops.map((crop) => (
                      <span
                        key={crop}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9F3EE] text-[#2E6349] font-medium"
                      >
                        🌸 {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lifetime Khata Stats */}
                <div className="pt-2 border-t border-[#F4EFEA] space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-center bg-[#FCFBF9] p-2 rounded-xl border border-[#E8E2D9] text-[11px]">
                    <div>
                      <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                        Total Lots
                      </span>
                      <span className="font-black text-xs text-[#2A1F1A]">{stats.totalLots}</span>
                    </div>

                    <div>
                      <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                        Volume
                      </span>
                      <span className="font-black text-xs text-[#2A1F1A]">
                        {stats.totalVolume.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                        Turnover
                      </span>
                      <span className="font-black text-xs text-[#2E6349]">
                        ₹{stats.totalTurnover.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Pending Dues Banner */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-[#6B5E57]">Pending Dues:</span>
                    <span
                      className={`font-mono font-bold ${
                        stats.pendingDues > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      ₹{stats.pendingDues.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* View Ledger Action */}
                  <button
                    id={`view-ledger-btn-${farmer.id}`}
                    onClick={() => setSelectedLedgerFarmer(farmer)}
                    className="w-full py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#2E6349]" />
                    <span>{t('viewLedger')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Farmer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D9] overflow-hidden">
            <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#DD9F2F]" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingFarmer ? 'Edit Farmer Profile' : t('addNewFarmerTitle')}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmer} className="p-5 space-y-4 bg-[#FCFBF9] max-h-[80vh] overflow-y-auto">
              {/* Photo of Farmer */}
              <PhotoUploadPicker
                label="Photo of Farmer (రైతు ఫోటో)"
                sublabel="Upload, snap with webcam, or choose authentic flower grower avatar"
                currentPhotoUrl={formPhotoUrl}
                onChange={(url) => setFormPhotoUrl(url)}
                presetType="farmer"
                idPrefix="farmers-view-modal"
              />

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerFullName')} *
                </label>
                <input
                  id="farmer-modal-name-input"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerPhone')} *
                </label>
                <input
                  id="farmer-modal-phone-input"
                  type="tel"
                  required
                  placeholder="e.g. 9848123456"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white font-mono focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerVillage')} *
                </label>
                <input
                  id="farmer-modal-village-input"
                  type="text"
                  required
                  placeholder="e.g. Shamshabad / Medchal"
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1.5">
                  {t('primaryCropsLabel')}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {flowerVarietiesData.map((v) => {
                    const isChecked = formCrops.includes(v.en);
                    const label = language === 'te' ? v.te : language === 'hi' ? v.hi : v.en;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleCrop(v.en)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition ${
                          isChecked
                            ? 'bg-[#E9F3EE] text-[#2E6349] border-[#2E6349] font-bold'
                            : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  id="submit-farmer-btn"
                  className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition shadow-xs"
                >
                  {t('saveFarmer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Farmer Ledger Modal */}
      {selectedLedgerFarmer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0">
                  {selectedLedgerFarmer.photoUrl ? (
                    <img
                      src={selectedLedgerFarmer.photoUrl}
                      alt={selectedLedgerFarmer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#DD9F2F] font-black">
                      {selectedLedgerFarmer.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                    <span>Farmer Khata: {selectedLedgerFarmer.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/15 text-[#DD9F2F]">
                      {selectedLedgerFarmer.id}
                    </span>
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    📍 {selectedLedgerFarmer.village} • Ph: +91 {selectedLedgerFarmer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLedgerFarmer(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khata Summary Pills */}
            {(() => {
              const stats = getFarmerStats(selectedLedgerFarmer.id);
              return (
                <div className="p-4 bg-[#FCFBF9] border-b border-[#E8E2D9] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E2D9]">
                    <span className="text-[#6B5E57] block text-[10px] uppercase font-bold">Total Lots</span>
                    <span className="text-base font-black text-[#2A1F1A]">{stats.totalLots}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E2D9]">
                    <span className="text-[#6B5E57] block text-[10px] uppercase font-bold">Gross Turnover</span>
                    <span className="text-base font-black text-[#2E6349]">₹{stats.totalTurnover.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E2D9]">
                    <span className="text-[#6B5E57] block text-[10px] uppercase font-bold">Total Paid</span>
                    <span className="text-base font-black text-emerald-700">₹{stats.totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8E2D9]">
                    <span className="text-[#6B5E57] block text-[10px] uppercase font-bold">Pending Dues</span>
                    <span className={`text-base font-black ${stats.pendingDues > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      ₹{stats.pendingDues.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Historical Lot Transactions List */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FCFBF9]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
                Transaction History ({farmerLots.length} consignments)
              </h4>

              {farmerLots.length === 0 ? (
                <p className="text-xs text-[#6B5E57] text-center py-6">
                  No lots recorded for this farmer yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8E2D9] rounded-xl bg-white">
                    <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold border-b border-[#E8E2D9]">
                      <tr>
                        <th className="p-2.5">Date / Parchi #</th>
                        <th className="p-2.5">Flower Variety</th>
                        <th className="p-2.5">Qty</th>
                        <th className="p-2.5">Rate (₹)</th>
                        <th className="p-2.5">Gross (₹)</th>
                        <th className="p-2.5">Net (₹)</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Parchi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]">
                      {farmerLots.map((lot) => (
                        <tr key={lot.id} className="hover:bg-[#FCFBF9]">
                          <td className="p-2.5 font-mono">
                            <span className="font-bold text-[#2E6349] block">{lot.parchiNumber}</span>
                            <span className="text-[10px] text-[#6B5E57]">{lot.date} • {lot.time}</span>
                          </td>
                          <td className="p-2.5 font-medium text-[#2A1F1A]">{lot.flowerVariety}</td>
                          <td className="p-2.5">{lot.quantity} {lot.unit}</td>
                          <td className="p-2.5">₹{lot.rate}</td>
                          <td className="p-2.5 font-mono">₹{lot.grossTotal}</td>
                          <td className="p-2.5 font-mono font-bold text-[#2A1F1A]">
                            ₹{lot.farmerNetPayable}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lot.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lot.paymentStatus === 'Partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {lot.paymentStatus}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() => setSelectedParchiLot(lot)}
                              className="p-1 rounded bg-[#FCFBF9] border border-[#E8E2D9] text-[#2E6349] hover:bg-gray-100"
                              title="Print / View Parchi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-[#E8E2D9] flex justify-end">
              <button
                onClick={() => setSelectedLedgerFarmer(null)}
                className="px-4 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
