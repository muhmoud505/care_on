import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { hp } from '../utils/responsive';

const ListContainer = ({ loading, error, data, emptyListMessage, onRefresh, refreshing, ...flatListProps }) => {
  const { t } = useTranslation();

  if (loading) {
    return <ActivityIndicator size="large" color="#014CC4" style={styles.indicator} />;
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyText}>
        {emptyListMessage || t('common.no_items_found')}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      // A more robust alternative using RefreshControl component
      // refreshControl={
      //   onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#014CC4"]} tintColor={"#014CC4"} /> : undefined
      // }
      {...flatListProps}
    />
  );
};

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: hp(2),
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: hp(2),
  },
});

export default ListContainer;