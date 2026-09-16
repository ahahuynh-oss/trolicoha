import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RadarChartProps {
  data: { axis: string; value: number }[];
  width?: number;
  height?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, width = 300, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);
    
    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const angleSlice = (Math.PI * 2) / data.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);

    // Draw circular grid lines
    const axisGrid = svg.append("g").attr("class", "axisWrapper");
    const levels = 5;
    
    for (let i = 0; i < levels; i++) {
      const levelFactor = radius * ((i + 1) / levels);
      axisGrid.append("circle")
        .attr("r", levelFactor)
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", 0.1);
    }

    // Draw axes
    const axis = axisGrid.selectAll(".axis")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("class", "line")
      .style("stroke", "white")
      .style("stroke-width", "2px");

    // Axis labels
    axis.append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(120) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(120) * Math.sin(angleSlice * i - Math.PI / 2))
      .text((d) => d.axis);

    // Draw the radar area
    const radarLine = d3.lineRadial<{ axis: string; value: number }>()
      .angle((d, i) => i * angleSlice)
      .radius((d) => rScale(d.value))
      .curve(d3.curveLinearClosed);

    svg.append("path")
      .datum(data)
      .attr("class", "radarArea")
      .attr("d", radarLine)
      .style("fill", "#d97757")
      .style("fill-opacity", 0.5)
      .style("stroke", "#d97757")
      .style("stroke-width", 2);

    // Draw dots
    svg.selectAll(".radarCircle")
      .data(data)
      .enter().append("circle")
      .attr("class", "radarCircle")
      .attr("r", 4)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", "#d97757")
      .style("fill-opacity", 0.8);

  }, [data, width, height]);

  return (
    <div className="flex justify-center items-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};
