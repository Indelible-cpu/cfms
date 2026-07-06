import './TreeLoader.css';

export default function TreeLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      {/* Trees Container */}
      <div className="flex items-end justify-center gap-2 h-16">
        {/* Small Tree */}
        <div className="tree-loader tree-small bg-forest w-3 rounded-t-full" />
        
        {/* Medium Tree */}
        <div className="tree-loader tree-medium bg-forest w-4 rounded-t-full" />
        
        {/* Large Tree */}
        <div className="tree-loader tree-large bg-forest w-5 rounded-t-full" />
        
        {/* Medium Tree */}
        <div className="tree-loader tree-medium bg-forest w-4 rounded-t-full" />
        
        {/* Small Tree */}
        <div className="tree-loader tree-small bg-forest w-3 rounded-t-full" />
      </div>
      
      {/* Loading Text */}
      <p className="animate-pulse text-sm font-semibold tracking-[0.2em] uppercase text-forest/70">
        Growing...
      </p>
    </div>
  );
}
