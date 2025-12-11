'use client';

interface DeliveryTypeOptionsProps {
    selectedType: string | null;
    onSelectType: (type: string) => void;
    deliveryTypes: { value: string; label: string }[];
}

// const deliveryTypes = [
//   { value: 'CORE', label: 'CORE' },
//   { value: 'JARS', label: 'JARS' },
//   { value: 'KEGS', label: 'KEGS' },
//   { value: 'MECHA', label: 'MECHA' },
// ];

export default function DeliveryTypeOptions({
                                                selectedType,
                                                onSelectType,
                                                deliveryTypes
                                            }: DeliveryTypeOptionsProps) {
    return (
        <div className="px-4 pt-4">
            {deliveryTypes.map((type) => {
                const isSelected = selectedType === type.value;
                return (
                    <button
                        key={type.value}
                        onClick={() => onSelectType(type.value)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors rounded"
                        style={{
                            backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        {/* Custom radio circle - reused pattern from DeliveryTypeDropdown */}
                        <div
                            className="relative flex items-center justify-center"
                            style={{width: '16px', height: '16px'}}
                        >
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
                        <span className="text-sm font-normal" style={{color: '#252525'}}>
            {type.label}
          </span>
                    </button>
                );
            })}
        </div>
    );
}
