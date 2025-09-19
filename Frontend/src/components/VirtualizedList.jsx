// Frontend/src/components/VirtualizedList.jsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedEquipmentList = ({ items, height = 400 }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EquipmentCard equipment={items[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={120}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};