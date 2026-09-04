type IconProps = {
  src: string;
  className?: string;
};

/**
 * 用 CSS mask 渲染 Figma 匯出的單色 icon，顏色跟著 text-color 走（currentColor）。
 * Figma 匯出的 SVG 顏色是匯出當下的狀態色，用 mask 才能在 active/inactive 間重新上色。
 */
export default function Icon({ src, className = "" }: IconProps) {
  return (
    <span
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
