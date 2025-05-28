import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideCharts, BaseChartDirective } from 'ng2-charts';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title, Tooltip } from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip
);
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective
  ],
  providers: [
    provideCharts()
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usersCount: number = 0;
  templatesCount: number = 0;
  submissionsCount: number = 0;
  processesCount: number = 0;

  public barChartData = [
    {
      data: [0, 0, 0, 0],
      label: 'Statistics',
      backgroundColor: [
        'rgba(0, 86, 179, 0.8)',
        'rgba(230, 57, 70, 0.8)',
        'rgba(0, 86, 179, 0.6)',
        'rgba(230, 57, 70, 0.6)'
      ],
      borderColor: [
        'rgba(0, 86, 179, 1)',
        'rgba(230, 57, 70, 1)',
        'rgba(0, 86, 179, 1)',
        'rgba(230, 57, 70, 1)'
      ],
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: [
        'rgba(0, 86, 179, 1)',
        'rgba(230, 57, 70, 1)',
        'rgba(0, 86, 179, 1)',
        'rgba(230, 57, 70, 1)'
      ]
    }
  ];

  public barChartLabels = ['Users', 'Templates', 'Submissions', 'Processes'];
  public barChartLegend = true;
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#4a5568',
          font: {
            size: 12,
            family: 'Segoe UI'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold',
          family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        } as any,
        bodyFont: {
          size: 12,
          family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#4a5568',
          font: {
            size: 11,
            family: 'Segoe UI'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#4a5568',
          font: {
            size: 11,
            family: 'Segoe UI'
          },
          stepSize: 1
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.dashboardService.countUsers().subscribe(count => {
      this.usersCount = count;
      this.updateChart();
    });

    this.dashboardService.countFormTemplates().subscribe(count => {
      this.templatesCount = count;
      this.updateChart();
    });

    this.dashboardService.countFormSubmissions().subscribe(count => {
      this.submissionsCount = count;
      this.updateChart();
    });

    this.dashboardService.countDeployedProcesses().subscribe({
      next: (count) => {
        this.processesCount = count;
        this.updateChart();
      },
      error: (error) => {
        console.error('Error counting deployed processes:', error);
        // Fallback to 0 if there's an error
        this.processesCount = 0;
        this.updateChart();
      }
    });
  }

  updateChart() {
    this.barChartData = [
      {
        data: [
          this.usersCount,
          this.templatesCount,
          this.submissionsCount,
          this.processesCount
        ],
        label: 'Statistics',
        backgroundColor: [
          'rgba(0, 86, 179, 0.8)',
          'rgba(230, 57, 70, 0.8)',
          'rgba(0, 86, 179, 0.6)',
          'rgba(230, 57, 70, 0.6)'
        ],
        borderColor: [
          'rgba(0, 86, 179, 1)',
          'rgba(230, 57, 70, 1)',
          'rgba(0, 86, 179, 1)',
          'rgba(230, 57, 70, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: [
          'rgba(0, 86, 179, 1)',
          'rgba(230, 57, 70, 1)',
          'rgba(0, 86, 179, 1)',
          'rgba(230, 57, 70, 1)'
        ]
      }
    ];
  }
}