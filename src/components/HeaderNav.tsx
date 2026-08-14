import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useTour } from '../context/TourContext';
import { Palmtree, Home, Users, Download, Upload, Plus } from 'lucide-react-native';

interface HeaderNavProps {
  onOpenCreateModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenCreateModal }) => {
  const { activeView, setActiveView, exportDataJSON, importDataJSON } = useTour();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowDimensions();

  const isMobile = width < 640;

  const handleFileChange = (event: any) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = importDataJSON(content);
          if (success) {
            alert('✅ Backup restored successfully!');
          } else {
            alert('❌ Invalid JSON backup file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      {/* Hidden file input for web backup import */}
      <input
        type="file"
        ref={fileInputRef as any}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />

      <View style={styles.content}>
        {/* Brand Header */}
        <TouchableOpacity
          style={styles.brand}
          onPress={() => setActiveView('home')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, isMobile && styles.iconContainerMobile]}>
            <Palmtree size={isMobile ? 18 : 22} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.brandTitle, isMobile && styles.brandTitleMobile]}>Tour Manager</Text>
            {!isMobile && <Text style={styles.brandSubtitle}>Group Ledger & Budget Tracker</Text>}
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isMobile && (
            <>
              <TouchableOpacity
                style={[styles.navBtn, activeView === 'home' && styles.navBtnActive]}
                onPress={() => setActiveView('home')}
              >
                <Home size={16} color={activeView === 'home' ? '#37B149' : '#475569'} />
                <Text style={[styles.navBtnText, activeView === 'home' && styles.navBtnTextActive]}>
                  Tours
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navBtn, (activeView === 'members' || activeView === 'member-detail') && styles.navBtnActive]}
                onPress={() => setActiveView('members')}
              >
                <Users size={16} color={(activeView === 'members' || activeView === 'member-detail') ? '#37B149' : '#475569'} />
                <Text style={[styles.navBtnText, (activeView === 'members' || activeView === 'member-detail') && styles.navBtnTextActive]}>
                  Members
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={[styles.exportBtn, isMobile && styles.iconBtnOnly]} onPress={exportDataJSON} title="Export Backup">
            <Download size={15} color="#2563EB" />
            {!isMobile && <Text style={styles.exportBtnText}>Export</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.importBtn, isMobile && styles.iconBtnOnly]} onPress={triggerImport} title="Import Backup">
            <Upload size={15} color="#D97706" />
            {!isMobile && <Text style={styles.importBtnText}>Import</Text>}
          </TouchableOpacity>

          {!isMobile && (
            <TouchableOpacity style={styles.createBtn} onPress={onOpenCreateModal}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Create Tour</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3
  },
  headerMobile: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  content: {
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#37B149',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconContainerMobile: {
    width: 34,
    height: 34,
    borderRadius: 10
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  brandTitleMobile: {
    fontSize: 16
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  navBtnActive: {
    backgroundColor: '#E8F7EA',
    borderColor: '#37B149'
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569'
  },
  navBtnTextActive: {
    color: '#37B149'
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB'
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  importBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706'
  },
  iconBtnOnly: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#37B149',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
