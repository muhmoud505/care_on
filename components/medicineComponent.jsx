import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { hp, wp } from '../utils/responsive';
import CollapsibleCard from './CollapsibleCard';
import { Icons } from './Icons';

const Medicine = ({
  id,
  title,
  from,
  to,
  description,
  icon,
  expanded,
  onExpandedChange
}) => {
  const { t, i18n } = useTranslation();
  // Inline RTL logic
  const isRTL = i18n.dir() === 'rtl';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  let parsedDescription = { dosage: '', startDate: '', endDate: '' };
  if (description && typeof description === 'string' && description.startsWith('{')) {
    try {
      parsedDescription = JSON.parse(description);
    } catch (e) {
      parsedDescription.dosage = description;
    }
  } else {
    parsedDescription.dosage = description || '';
  }

  const displayStartDate = parsedDescription.startDate || from || '';
  const displayEndDate = parsedDescription.endDate || to || '';
  const displayDosage = parsedDescription.dosage || '';

  return (
    <CollapsibleCard
      title={title}
      icon={Icons.Medicine}
      isExpanded={expanded}
      onToggle={onExpandedChange}
    >
      <View style={styles.expandedContent}>

        {/* Date Row */}
        <View style={[styles.dateRow, { flexDirection: rowDirection }]}>

          {/* Right: End Date (الى / تاريخ النهاية) */}
          <View style={styles.dateItem}>
            <Icons.Calendara width={16} height={16} />
            <Text style={styles.labelTxt} numberOfLines={1}>
              {t('medicine.end_date')}:
            </Text>
            <Text style={styles.valueTxt} numberOfLines={1}>
              {displayEndDate}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Left: Start Date (من / تاريخ البداية) */}
          <View style={styles.dateItem}>
            <Icons.Calendara width={16} height={16} />
            <Text style={styles.labelTxt} numberOfLines={1}>
              {t('medicine.start_date')}:
            </Text>
            <Text style={styles.valueTxt} numberOfLines={1}>
              {displayStartDate}
            </Text>
          </View>

        </View>

        {/* Dosage Row */}
        <View style={[styles.dosageRow, { flexDirection: rowDirection }]}>
          <Icons.ReceiptEdit width={16} height={16} />
          <Text style={styles.labelTxt}>{t('medicine.dosage')}:</Text>
          <Text style={styles.dosageValue} numberOfLines={1}>
            {displayDosage}
          </Text>
        </View>

      </View>
    </CollapsibleCard>
  );
};

export default Medicine;

const styles = StyleSheet.create({
  expandedContent: {
    paddingTop: hp(1),
    paddingHorizontal: wp(1),
    gap: hp(1),
  },

  // ── Date row ──────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp(2),
  },

  // ── Dosage row ────────────────────────────────────
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  dosageValue: {
    fontWeight: '500',
    fontSize: Math.min(wp(3.5), 14),
    color: '#000000',
    flexShrink: 1,
  },

  // ── Shared text ───────────────────────────────────
  labelTxt: {
    fontWeight: '600',
    fontSize: Math.min(wp(3), 12),   // slightly smaller so it fits
    color: '#555555',
    flexShrink: 0,                   // never shrink the label
  },
  valueTxt: {
    fontWeight: '500',
    fontSize: Math.min(wp(3), 12),
    color: '#000000',
    flexShrink: 1,                   // date value shrinks if needed
  },
});