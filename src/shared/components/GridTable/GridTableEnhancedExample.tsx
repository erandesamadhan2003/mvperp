/**
 * Example: GridTableEnhanced with TanStack React Table & React Virtual
 * 
 * This example demonstrates:
 * - Using GridTableEnhanced for student data
 * - Pagination (10 rows per page)
 * - Virtualization for performance
 * - Cell editing
 * - Keyboard navigation
 * - Row styling based on data
 */

'use client';

import React, { useMemo, useState } from 'react';
import { GridTableEnhanced } from '@/shared/components/GridTable';
import type { GridColumn, GridChangeEvent, GridRowData } from '@/shared/components/GridTable';

// Example data type
interface StudentRecord {
    id: string;
    name: string;
    email: string;
    rollNo: string;
    department: string;
    admission: string;
    gpa: number;
    status: 'active' | 'graduated' | 'suspended';
}

// Column definitions
const STUDENT_COLUMNS: GridColumn<StudentRecord>[] = [
    {
        key: 'name',
        title: 'Student Name',
        width: 180,
        editable: true,
        sortable: true,
        align: 'left',
    },
    {
        key: 'email',
        title: 'Email Address',
        width: 220,
        editable: true,
        align: 'left',
    },
    {
        key: 'rollNo',
        title: 'Roll Number',
        width: 120,
        editable: false,
        align: 'center',
    },
    {
        key: 'department',
        title: 'Department',
        width: 140,
        editable: true,
        align: 'center',
    },
    {
        key: 'admission',
        title: 'Admission Date',
        width: 140,
        dataType: 'date',
        align: 'center',
    },
    {
        key: 'gpa',
        title: 'GPA',
        width: 100,
        editable: true,
        dataType: 'number',
        align: 'right',
    },
    {
        key: 'status',
        title: 'Status',
        width: 120,
        editable: true,
        align: 'center',
    },
];

// Generate sample data (for demonstration)
function generateSampleStudents(count: number): StudentRecord[] {
    const departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science'];
    const statuses = ['active', 'graduated', 'suspended'] as const;

    return Array.from({ length: count }, (_, i) => ({
        id: `STU-${String(i + 1).padStart(5, '0')}`,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@university.edu`,
        rollNo: String(i + 1).padStart(3, '0'),
        department: departments[Math.floor(Math.random() * departments.length)],
        admission: new Date(2022 + Math.floor(i / 100), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        gpa: Math.round((Math.random() * 4 + 0.5) * 100) / 100,
        status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
}

/**
 * Main example component
 */
export function GridTableEnhancedExample() {
    // Generate sample data
    const students = useMemo(() => generateSampleStudents(250), []);

    const [editHistory, setEditHistory] = useState<Array<{
        timestamp: string;
        studentId: string;
        field: string;
        oldValue: any;
        newValue: any;
    }>>([]);

    const [currentPage, setCurrentPage] = useState(0);

    // Handle cell changes
    const handleCellChange = (event: GridChangeEvent<StudentRecord>) => {
        const timestamp = new Date().toLocaleTimeString();

        console.log('Cell Change Event:', {
            timestamp,
            cellPosition: event.cellPosition,
            columnKey: event.columnKey,
            previousValue: event.previousValue,
            newValue: event.newValue,
            studentId: event.rowId,
        });

        // Record change for audit trail
        setEditHistory((prev) => [
            ...prev.slice(-99), // Keep last 100
            {
                timestamp,
                studentId: String(event.rowId),
                field: event.columnKey,
                oldValue: event.previousValue,
                newValue: event.newValue,
            },
        ]);

        // TODO: Send update to backend API
        // api.updateStudent(event.rowId, {
        //   [event.columnKey]: event.newValue,
        // });
    };

    // Row styling based on status
    const getRowClassName = (rowData: GridRowData<StudentRecord>, rowIndex: number) => {
        const student = rowData.data;
        if (student.status === 'graduated') return 'bg-green-50 text-green-900';
        if (student.status === 'suspended') return 'bg-red-50 text-red-900';
        if (student.gpa >= 3.5) return 'bg-blue-50';
        return '';
    };

    // Cell styling based on value
    const getCellClassName = (
        value: any,
        rowData: GridRowData<StudentRecord>,
        rowIndex: number,
        colIndex: number
    ) => {
        const student = rowData.data;

        // Highlight high GPAs
        if (colIndex === 5 && typeof value === 'number') {
            if (value >= 3.8) return 'font-bold text-green-600';
            if (value < 2.0) return 'font-bold text-red-600';
        }

        // Highlight status
        if (colIndex === 6) {
            if (value === 'active') return 'font-semibold text-blue-600';
            if (value === 'graduated') return 'font-semibold text-green-600';
            if (value === 'suspended') return 'font-semibold text-red-600';
        }

        return '';
    };

    // Handle row click
    const handleRowClick = (student: StudentRecord, rowIndex: number) => {
        console.log('Row clicked:', { student, rowIndex });
        // TODO: Navigate to student details page
        // router.push(`/admin/students/${student.id}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    GridTableEnhanced Example
                </h1>
                <p className="mt-2 text-slate-600">
                    Virtualized grid with {students.length} student records, pagination, and live editing
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-semibold">Total Students</div>
                    <div className="text-2xl font-bold text-blue-900">{students.length}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-semibold">Active</div>
                    <div className="text-2xl font-bold text-green-900">
                        {students.filter((s) => s.status === 'active').length}
                    </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 font-semibold">Graduated</div>
                    <div className="text-2xl font-bold text-purple-900">
                        {students.filter((s) => s.status === 'graduated').length}
                    </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600 font-semibold">Edits Recorded</div>
                    <div className="text-2xl font-bold text-red-900">{editHistory.length}</div>
                </div>
            </div>

            {/* Grid */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm" style={{ height: '600px' }}>
                <GridTableEnhanced<StudentRecord>
                    columns={STUDENT_COLUMNS}
                    data={students}
                    onChange={handleCellChange}
                    onRowClick={handleRowClick}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        console.log('Page changed to:', page);
                    }}
                    rowHeight={36}
                    headerHeight={44}
                    bordered={true}
                    striped={true}
                    hoverable={true}
                    editable={true}
                    keyboardNavigation={true}
                    emptyMessage="No students found"
                    rowClassName={getRowClassName}
                    cellClassName={getCellClassName}
                />
            </div>

            {/* Edit History */}
            <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">
                    Edit Audit Trail ({editHistory.length} edits)
                </h3>
                {editHistory.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No edits yet. Try double-clicking cells to edit.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {editHistory
                            .slice()
                            .reverse()
                            .map((edit, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded text-sm font-mono">
                                    <div className="text-xs text-slate-500">{edit.timestamp}</div>
                                    <div className="mt-1">
                                        <span className="font-semibold text-blue-600">{edit.studentId}</span>
                                        <span className="text-slate-600 mx-2">•</span>
                                        <span className="font-semibold">{edit.field}</span>
                                        <span className="text-slate-600 mx-2">:</span>
                                        <span className="text-red-600">{JSON.stringify(edit.oldValue)}</span>
                                        <span className="text-slate-600 mx-2">→</span>
                                        <span className="text-green-600">{JSON.stringify(edit.newValue)}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">✨ Features</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>✓ Virtualized rows (handles 10k+ efficiently)</li>
                        <li>✓ Pagination (10 rows per page)</li>
                        <li>✓ Double-click to edit cells</li>
                        <li>✓ Excel-like keyboard navigation</li>
                    </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">⌨️ Keyboard Shortcuts</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>↑↓←→ Navigate cells</li>
                        <li>Enter to edit / Save</li>
                        <li>Escape to cancel</li>
                        <li>Tab to next cell</li>
                    </ul>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📝 Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Double-click</strong> any cell to edit (except Roll Number)</li>
                    <li>• <strong>Navigate</strong> with arrow keys or click cells</li>
                    <li>• <strong>Tab/Shift+Tab</strong> to move between cells faster</li>
                    <li>• <strong>Press Enter</strong> to save, <strong>Escape</strong> to cancel</li>
                    <li>• <strong>Click rows</strong> to see console logs</li>
                    <li>• <strong>Scroll</strong> to see virtualization in action</li>
                </ul>
            </div>
        </div>
    );
}
