import { useState } from 'react';

interface TagInputProps {
  tags: string[];
  suggestedTags?: string[];
  onToggleTag: (tag: string) => void;
  label?: string;
  required?: boolean;
}

function TagInput({
  tags,
  suggestedTags = [],
  onToggleTag,
  label = 'Tags',
  required = false
}: TagInputProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onToggleTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
        {label}
        {!required && <span className="text-xs sm:text-sm text-gray-500 ml-1">(optional)</span>}
      </label>

      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 text-xs sm:text-sm font-medium"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm border bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                {tag} ×
              </button>
            ))}
          </div>
        )}

        {suggestedTags.length > 0 && tags.length < suggestedTags.length && (
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {suggestedTags
                .filter(tag => !tags.includes(tag))
                .slice(0, 6)
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(tag)}
                    className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TagInput;
