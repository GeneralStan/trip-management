'use client';

interface DeliveryTypeDropdownProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const deliveryTypes = [
  { value: 'CORE', label: 'CORE' },
  { value: 'JARS', label: 'JARS' },
  { value: 'KEGS', label: 'KEGS' },
  { value: 'MECHA', label: 'MECHA' },
];

export default function DeliveryTypeDropdown({ selectedType, onSelectType }: DeliveryTypeDropdownProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg py-2"
      style={{
        width: '160px',
        border: '1px solid #E3E3E3',
      }}
    >
      {deliveryTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onSelectType(type.value)}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="relative flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
            {/* Outer circle */}
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: selectedType === type.value ? '#3B82F6' : '#D1D5DB',
              }}
            />
            {/* Inner filled circle */}
            {selectedType === type.value && (
              <div
                className="absolute rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#3B82F6',
                }}
              />
            )}
          </div>
          <span className="text-sm font-normal" style={{ color: '#252525' }}>
            {type.label}
          </span>
        </button>
      ))}
    </div>
  );
}
