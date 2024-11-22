import React, { useState } from "react";

type Item = {
  id: number;
  label: string;
};

type MultiSelectPopupProps = {
  items: Item[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedItems: Item[]) => void;
};

const MultiSelectPopup: React.FC<MultiSelectPopupProps> = ({
  items,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const handleToggleItem = (item: Item) => {
    const isAlreadySelected = selectedItems.some((selected) => selected.id === item.id);
    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Select Items</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedItems.some((selected) => selected.id === item.id)}
                  onChange={() => handleToggleItem(item)}
                />
                {item.label}
              </label>
            </li>
          ))}
        </ul>
        <div className="popup-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectPopup;
