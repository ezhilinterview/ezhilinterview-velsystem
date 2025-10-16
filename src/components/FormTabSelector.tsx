interface FormTabSelectorProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  disabled?: boolean;
}

function FormTabSelector({ tabs, activeTab, onTabChange, disabled = false }: FormTabSelectorProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {tabs.map((tab, index) => {
        const active = activeTab === index;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => !disabled && onTabChange(index)}
            disabled={disabled}
            className={`flex-1 text-xs sm:text-sm font-medium rounded-lg py-2 transition-all duration-200 ${
              active
                ? "bg-white shadow text-black"
                : "text-gray-500 hover:text-black"
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export default FormTabSelector;
