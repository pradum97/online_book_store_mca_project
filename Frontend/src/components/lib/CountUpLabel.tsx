"use client";

import React from "react";
import CountUp from "react-countup";

type CountUpInlineLabelProps = {
  start?: number;
  end: number;
  duration?: number;
  labelPrefix?: string;
  labelSuffix?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  countClassName?: string;
  valyeStyle?: React.CSSProperties | undefined;
};

const CountUpInlineLabel: React.FC<CountUpInlineLabelProps> = ({
  start = 0,
  end,
  duration = 2,
  labelPrefix = "",
  labelSuffix = "",
  prefix = "",
  suffix = "",
  className = "",
  countClassName = "",
  valyeStyle,
}) => {
  return (
    <div className={`text-base font-medium ${className}`}>
      {labelPrefix}
      <span
        className={`${countClassName}`}
        style={{
          color: "#ce210ade",
          marginLeft: "5px",
          fontSize: "14px",
          ...valyeStyle,
        }}
      >
        <span>(</span>
        <span style={{ marginLeft: "2px", marginRight: "2px" }}>
          <CountUp
            start={start}
            end={end}
            duration={duration}
            prefix={prefix}
            suffix={suffix}
          />
        </span>
        <span>)</span>
      </span>
      {labelSuffix}
    </div>
  );
};

export default CountUpInlineLabel;
