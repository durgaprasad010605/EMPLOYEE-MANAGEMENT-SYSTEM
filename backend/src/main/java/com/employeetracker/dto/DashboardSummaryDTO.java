package com.employeetracker.dto;

public class DashboardSummaryDTO {
    private long totalEmployees;
    private long presentToday;
    private long onLeaveToday;
    private long totalDepartments;
    private String employeeGrowth; // e.g. "↑ 12% from last month"
    private String attendanceRate;  // e.g. "87% attendance"
    private String leaveRate;       // e.g. "4.8% of total"
    private String departmentSubtitle; // e.g. "Active departments"

    public DashboardSummaryDTO() {}

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getPresentToday() { return presentToday; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }

    public long getOnLeaveToday() { return onLeaveToday; }
    public void setOnLeaveToday(long onLeaveToday) { this.onLeaveToday = onLeaveToday; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public String getEmployeeGrowth() { return employeeGrowth; }
    public void setEmployeeGrowth(String employeeGrowth) { this.employeeGrowth = employeeGrowth; }

    public String getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(String attendanceRate) { this.attendanceRate = attendanceRate; }

    public String getLeaveRate() { return leaveRate; }
    public void setLeaveRate(String leaveRate) { this.leaveRate = leaveRate; }

    public String getDepartmentSubtitle() { return departmentSubtitle; }
    public void setDepartmentSubtitle(String departmentSubtitle) { this.departmentSubtitle = departmentSubtitle; }
}
