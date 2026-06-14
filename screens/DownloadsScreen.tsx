import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, CheckCircle, AlertCircle, Loader } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { useBrowserStore } from '../store/browserStore';

export const DownloadsScreen: React.FC = () => {
  const { downloads } = useBrowserStore();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07080F', '#000000']} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
        <Text style={styles.headerSub}>{downloads.length} files</Text>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {downloads.length === 0 ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <LinearGradient
                colors={['rgba(255,77,0,0.15)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Download size={36} color={COLORS.flame} />
            </View>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySub}>Files you download will appear here</Text>
          </Animated.View>
        ) : (
          downloads.map((dl, i) => (
            <Animated.View key={dl.id} entering={FadeInDown.delay(i * 60).springify()}>
              <GlassCard style={styles.card} intensity="low" radius={RADIUS.xl}>
                <View style={styles.cardInner}>
                  <View style={styles.fileIcon}>
                    {dl.status === 'completed' ? (
                      <CheckCircle size={20} color={COLORS.emerald} />
                    ) : dl.status === 'failed' ? (
                      <AlertCircle size={20} color={COLORS.rose} />
                    ) : (
                      <Loader size={20} color={COLORS.flame} />
                    )}
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{dl.filename}</Text>
                    <Text style={styles.fileMeta}>
                      {(dl.size / 1024 / 1024).toFixed(1)} MB · {dl.status}
                    </Text>
                    {dl.status === 'downloading' && (
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${(dl.downloaded / dl.size) * 100}%` as any },
                          ]}
                        >
                          <LinearGradient
                            colors={[COLORS.flame, COLORS.flameSoft]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  header: {
    paddingTop: 60, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.base,
  },
  headerTitle: { fontSize: FONT.xxl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  headerSub: { fontSize: FONT.sm, color: COLORS.textTertiary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl },
  card: { marginBottom: SPACING.sm, borderRadius: RADIUS.xl, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
  fileIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center',
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: FONT.sm, fontWeight: FONT.medium, color: COLORS.textPrimary },
  fileMeta: { fontSize: FONT.xs, color: COLORS.textTertiary, marginTop: 2 },
  progressTrack: {
    height: 4, borderRadius: 2, backgroundColor: COLORS.glass,
    overflow: 'hidden', marginTop: SPACING.xs,
  },
  progressFill: { height: '100%', borderRadius: 2, overflow: 'hidden' },
  emptyState: { alignItems: 'center', paddingTop: 100, gap: SPACING.md },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyTitle: { fontSize: FONT.lg, fontWeight: FONT.semibold, color: COLORS.textSecondary },
  emptySub: { fontSize: FONT.base, color: COLORS.textTertiary },
});
