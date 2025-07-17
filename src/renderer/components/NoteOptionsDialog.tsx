import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: string[];
  sortOptions: string[];
  selectedFilters: string[];
  selectedSort: string;
  onApply: (filters: string[], sort: string) => void;
  onClear: () => void;
};

export default function FilterModal({
  isOpen,
  onClose,
  filterOptions,
  sortOptions,
  selectedFilters,
  selectedSort,
  onApply,
  onClear,
}: FilterModalProps) {
  const [filters, setFilters] = useState<string[]>(selectedFilters);
  const [sort, setSort] = useState<string>(selectedSort);

  useEffect(() => {
    setFilters(selectedFilters);
    setSort(selectedSort);
  }, [selectedFilters, selectedSort, isOpen]);

  const toggleFilter = (option: string) => {
    if (filters.includes(option)) {
      setFilters(filters.filter((f) => f !== option));
    } else {
      setFilters([...filters, option]);
    }
  };

  const handleApply = () => {
    onApply(filters, sort);
    onClose();
  };

  const handleClear = () => {
    setFilters([]);
    setSort("");
    onClear();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 text-left shadow-lg transition-all">
                <Dialog.Title className="text-lg font-raleway font-semibold text-white mb-4">
                  filter & sort
                </Dialog.Title>

                <div className="mb-6">
                  <p className="font-raleway text-white mb-2 font-semibold">filter by</p>
                  <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center cursor-pointer text-white select-none"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-white bg-black/60 border-white/40 rounded"
                          checked={filters.includes(option)}
                          onChange={() => toggleFilter(option)}
                        />
                        <span className="ml-2 font-raleway">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-raleway text-white mb-2 font-semibold">sort by</p>
                  <div className="flex flex-col space-y-2 max-h-32 overflow-y-auto">
                    {sortOptions.map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center cursor-pointer text-white select-none"
                      >
                        <input
                          type="radio"
                          name="sort"
                          className="form-radio h-5 w-5 text-white bg-black/60 border-white/40 rounded"
                          checked={sort === option}
                          onChange={() => setSort(option)}
                        />
                        <span className="ml-2 font-raleway">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClear}
                    className="font-raleway px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-red-900 transition"
                  >
                    clear
                  </button>
                  <button
                    onClick={handleApply}
                    className="font-raleway px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
                  >
                    apply
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
