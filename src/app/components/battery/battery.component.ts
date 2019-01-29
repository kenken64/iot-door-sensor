import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { chart, SolidGaugeChart } from "highcharts";
import * as Highcharts from "highcharts";
import * as solidGauge from "highcharts/modules/solid-gauge.src";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-battery",
  templateUrl: "./battery.component.html",
  styleUrls: ["./battery.component.css"]
})
export class BatteryComponent implements OnInit, AfterViewInit {
  @ViewChild("chartTarget")
  chartTarget: ElementRef;
  options: any;
  chart: Highcharts.ChartObject;
  vbatteryValue: any;
  doorName: string;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.vbatteryValue = this.activatedRoute.snapshot.params.value;
    this.doorName = this.activatedRoute.snapshot.params.name;
  }

  ngAfterViewInit() {
    this.initOptions();
    this.chart = chart(this.chartTarget.nativeElement, this.options as any);
  }

  initOptions() {
    this.options = {
      chart: {
        type: "solidgauge"
      },
      title: {
        text: "Battery Indicator"
      },
      pane: {
        startAngle: -90,
        endAngle: 90,
        background: {
          backgroundColor: "white",
          innerRadius: "60%",
          outerRadius: "90%",
          shape: "arc"
        }
      },
      tooltip: {
        enabled: false
      },
      // the value axis
      yAxis: {
        stops: [
          [0.5, "#DF5353"], // green
          [0.6, "yellow"], // yellow
          [0.9, "green"] // red
        ],
        length: 5,
        lineWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
          y: -70
        },
        labels: {
          y: 16
        },
        min: 0,
        max: 100,
        plotBands: [
          { from: 80, to: 100, color: "green" },
          { from: 50, to: 80, color: "yellow" },
          { from: 0, to: 20, color: "red" }
        ]
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }
        }
      },
      series: [
        {
          data: [+this.vbatteryValue]
        }
      ]
    };
  }
}
