"use client";

import * as React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";
import { LucideProps, LucideIcon } from 'lucide-react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/tooltip";
import { iconsData } from "./icons-data";
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { Skeleton } from "@/components/skeleton";
import Fuse from 'fuse.js';
import { useDebounceValue } from "usehooks-ts";

export type IconData = typeof iconsData[number];

interface IconPickerProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverTrigger>, 'onSelect' | 'onOpenChange'> {
  value?: IconName
  defaultValue?: IconName
  onValueChange?: (value: IconName) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  searchable?: boolean
  searchPlaceholder?: string
  triggerPlaceholder?: string
  iconsList?: IconData[]
  categorized?: boolean
  modal?: boolean
}

const IconRenderer = React.memo(({ name }: { name: IconName }) => {
  return <Icon name={name} />;
});
IconRenderer.displayName = "IconRenderer";

const IconsColumnSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <div className="grid grid-cols-5 gap-2 w-full">
        {Array.from({ length: 40 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-md" />
        ))}
      </div>
    </div>
  );
};

const useIconsData = () => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadIcons = async () => {
      setIsLoading(true);
      const { iconsData } = await import('./icons-data');
      if (isMounted) {
        setIcons(iconsData);
        setIsLoading(false);
      }
    };

    loadIcons();

    return () => {
      isMounted = false;
    };
  }, []);

  return { icons, isLoading };
};

const IconPicker = React.forwardRef<
  React.ComponentRef<typeof PopoverTrigger>,
  IconPickerProps
>(({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  children,
  searchable = true,
  searchPlaceholder = "search for an icon...",
  triggerPlaceholder = "icon",
  iconsList,
  categorized = true,
  modal = false,
  ...props
}, ref) => {
  const [selectedIcon, setSelectedIcon] = useState<IconName | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  const [search, setSearch] = useDebounceValue("", 100);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const { icons } = useIconsData();
  const [isLoading, setIsLoading] = useState(true);

  const iconsToUse = useMemo(() => iconsList || icons, [iconsList, icons]);

  const fuseInstance = useMemo(() => {
    return new Fuse(iconsToUse, {
      keys: ['name', 'tags', 'categories'],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [iconsToUse]);

  const filteredIcons = useMemo(() => {
    if (search.trim() === "") return iconsToUse;
    return fuseInstance.search(search.toLowerCase().trim()).map(res => res.item);
  }, [search, iconsToUse, fuseInstance]);

  const categorizedIcons = useMemo(() => {
    if (!categorized || search.trim() !== "") return [{ name: "All Icons", icons: filteredIcons }];

    const categories = new Map<string, IconData[]>();
    filteredIcons.forEach(icon => {
      if (icon.categories?.length) {
        icon.categories.forEach(cat => {
          if (!categories.has(cat)) categories.set(cat, []);
          categories.get(cat)!.push(icon);
        });
      } else {
        if (!categories.has("Other")) categories.set("Other", []);
        categories.get("Other")!.push(icon);
      }
    });

    return Array.from(categories.entries())
      .map(([name, icons]) => ({ name, icons }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredIcons, categorized, search]);

  const virtualItems = useMemo(() => {
    const items: Array<{ type: 'category' | 'row'; categoryIndex: number; rowIndex?: number; icons?: IconData[] }> = [];
    categorizedIcons.forEach((category, categoryIndex) => {
      items.push({ type: 'category', categoryIndex });
      for (let i = 0; i < category.icons.length; i += 5) {
        items.push({ type: 'row', categoryIndex, rowIndex: i / 5, icons: category.icons.slice(i, i + 5) });
      }
    });
    return items;
  }, [categorizedIcons]);

  const categoryIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    virtualItems.forEach((item, index) => {
      if (item.type === 'category') indices[categorizedIcons[item.categoryIndex].name] = index;
    });
    return indices;
  }, [virtualItems, categorizedIcons]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: idx => virtualItems[idx].type === 'category' ? 30 : 50,
    paddingEnd: 2,
    gap: 10,
    overscan: 5,
  });

  const handleValueChange = useCallback((icon: IconName) => {
    if (value === undefined) setSelectedIcon(icon);
    onValueChange?.(icon);
  }, [value, onValueChange]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setSearch("");
    if (open === undefined) setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    setIsPopoverVisible(newOpen);
    if (newOpen) setTimeout(() => { virtualizer.measure(); setIsLoading(false); }, 1);
  }, [open, onOpenChange, virtualizer]);

  const handleIconClick = useCallback((iconName: IconName) => {
    handleValueChange(iconName);
    setIsOpen(false);
    setSearch("");
  }, [handleValueChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (parentRef.current) parentRef.current.scrollTop = 0;
    virtualizer.scrollToOffset(0);
  }, [virtualizer]);

  const scrollToCategory = useCallback((categoryName: string) => {
    const idx = categoryIndices[categoryName];
    if (idx !== undefined) virtualizer.scrollToIndex(idx, { align: 'start', behavior: 'smooth' });
  }, [categoryIndices, virtualizer]);


  const renderIcon = useCallback((icon: IconData) => (
    <TooltipProvider key={icon.name}>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "p-2 rounded-xl text-white/50 border hover:bg-zinc-700 transition-all transform hover:scale-110",
            "flex items-center justify-center"
          )}
          onClick={() => handleIconClick(icon.name as IconName)}
        >
          <IconRenderer name={icon.name as IconName} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-white text-xs font-dm">{icon.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ), [handleIconClick]);

  const renderVirtualContent = useCallback(() => {
    if (!filteredIcons.length) return <div className="text-center text-gray-400 py-4">no icon found</div>;

    return (
      <div className="relative w-full overscroll-contain" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((vItem: VirtualItem) => {
          const item = virtualItems[vItem.index];
          if (!item) return null;
          const style = { position: 'absolute' as const, top: 0, left: 0, width: '100%', height: vItem.size, transform: `translateY(${vItem.start}px)` };
          if (item.type === 'category') {
            return (
              <div key={vItem.key} style={style} className=" rounded-[0.5em] z-10">
                <h3 className="font-semibold text-sm ml-1 text-white font-dm py-1">{categorizedIcons[item.categoryIndex].name}</h3>
                <div className="h-[1px] bg-zinc-700 w-full mb-1" />
              </div>
            );
          }
          return (
            <div key={vItem.key} style={style} data-index={vItem.index}>
              <div className="grid grid-cols-5 gap-2">{item.icons!.map(renderIcon)}</div>
            </div>
          );
        })}
      </div>
    );
  }, [virtualizer, virtualItems, categorizedIcons, filteredIcons, renderIcon]);

  React.useEffect(() => {
    if (isPopoverVisible) {
      setIsLoading(true);
      const timer = setTimeout(() => { setIsLoading(false); virtualizer.measure(); }, 10);
      const observer = new ResizeObserver(() => virtualizer.measure());
      if (parentRef.current) observer.observe(parentRef.current);
      return () => { clearTimeout(timer); observer.disconnect(); };
    }
  }, [isPopoverVisible, virtualizer]);

  return (
    <Popover open={open ?? isOpen} onOpenChange={handleOpenChange} modal={modal}>
<PopoverTrigger ref={ref} asChild {...props}>
  {children || (
    <div
      className="flex items-center justify-center bg-zinc-800 rounded-xl
                 h-10 w-10 transition-transform duration-200 ease-in-out
                 hover:scale-105 hover:shadow-lg hover:bg-zinc-700
                 focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50
                 active:scale-95"
    >
      {(value || selectedIcon) ? (
        <Icon name={(value || selectedIcon)!} className="w-5 h-5 text-white" />
      ) : (
        <span className="text-white text-xs font-medium select-none">icon</span>
      )}
    </div>
  )}
</PopoverTrigger>



      <PopoverContent className="w-80 max-h-[70vh] p-4 bg-zinc-950 rounded-xl border-none outline-none">
        {searchable && (
          <Input
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            className="mb-3 text-white bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-zinc-500 font-dm "
          />
        )}

        <div
          ref={parentRef}
          className="overflow-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 rounded-md"
        >
          {isLoading ? <IconsColumnSkeleton /> : renderVirtualContent()}
        </div>
      </PopoverContent>
    </Popover>
  );
});

IconPicker.displayName = "IconPicker";

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const Icon = React.forwardRef<React.ComponentRef<LucideIcon>, IconProps>(
  ({ name, ...props }, ref) => <DynamicIcon name={name} {...props} ref={ref} />
);
Icon.displayName = "Icon";

export { IconPicker, Icon, type IconName };
