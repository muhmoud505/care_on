import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Calendar = ({onDataSelect}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSelector, setShowSelector] = useState(false);

  // Helper functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const navigateMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setShowSelector(false); // Close selector when navigating months
  };

  const handleDateClick = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate)
    onDataSelect && onDataSelect(newDate)
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const daysArray = [];
    
    // Previous month's days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthDays - i,
        currentMonth: false,
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push({
        day,
        currentMonth: true,
        today: isToday(day),
        selected: isSelected(day),
      });
    }
    
    // Next month's days
    const totalDays = daysArray.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push({
        day: i,
        currentMonth: false,
      });
    }
    
    return daysArray;
  };

  const renderDayItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        item.today && styles.todayDay,
        item.selected && styles.selectedDay,
        !item.currentMonth && styles.otherMonthDay
      ]}
      onPress={() => item.currentMonth && handleDateClick(item.day)}
      disabled={!item.currentMonth}
    >
      <Text style={[
        styles.dayText,
        item.today && styles.todayText,
        item.selected && styles.selectedText,
        !item.currentMonth && styles.otherMonthText
      ]}>
        {item.day}
      </Text>
    </TouchableOpacity>
  );

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i);

  const renderMonthItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        index === currentDate.getMonth() && styles.selectedListItem
      ]}
      onPress={() => {
        const newDate = new Date(currentDate);
        newDate.setMonth(index);
        setCurrentDate(newDate);
        setShowSelector(false);
      }}
    >
      <Text style={styles.listItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderYearItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        item === currentDate.getFullYear() && styles.selectedListItem
      ]}
      onPress={() => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(item);
        setCurrentDate(newDate);
      }}
    >
      <Text style={styles.listItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Month/Year Selector */}
      {showSelector && (
        <View style={styles.selectorContainer}>
          <View style={styles.selectorColumns}>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Year</Text>
              <FlatList
                data={years}
                renderItem={renderYearItem}
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
                contentContainerStyle={styles.listContent}
              />
            </View>
            
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Month</Text>
              <FlatList
                data={monthNames}
                renderItem={renderMonthItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </View>
        </View>
      )}

      {/* Calendar Header */}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowSelector(!showSelector)}>
          <Text style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdaysContainer}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.daysContainer}>
        <FlatList
          data={generateDays()}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `${item.day}-${index}`}
          numColumns={7}
          scrollEnabled={false}
          contentContainerStyle={styles.daysGrid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    minHeight: 400,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    width:'100%',
  },
  selectorColumns: {
    flexDirection: 'row',
    height: 300,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4285f4',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedListItem: {
    backgroundColor: '#e6f2ff',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  daysContainer: {
    flex: 1,
  },
  daysGrid: {
    justifyContent: 'center',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#4285f4',
  },
  selectedDay: {
    backgroundColor: '#4285f4',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#999',
  },
});

export default Calendar;