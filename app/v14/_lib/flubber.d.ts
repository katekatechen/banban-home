// flubber 沒有附型別，這裡只宣告用到的 interpolate
declare module "flubber" {
  export function interpolate(
    from: string,
    to: string,
    options?: { maxSegmentLength?: number; string?: boolean },
  ): (t: number) => string;
}
