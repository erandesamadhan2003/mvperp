"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { GridTableEnhanced } from '@/shared/components/GridTable';
import type { GridColumn, GridChangeEvent } from '@/shared/components/GridTable';

type StudentRow = Record<string, any> & { id: string };

function makeColumns(): GridColumn<StudentRow>[] {
    const columnKeys = [
        'id', 'name', 'email', 'phone', 'department',
        'semester', 'rollNo', 'address', 'dob', 'enrollmentDate',
        'gpa', 'status', 'mentor', 'attendance', 'fees'
    ];

    const labels: Record<string, string> = {
        id: 'Student ID',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        department: 'Department',
        semester: 'Semester',
        rollNo: 'Roll No',
        address: 'Address',
        dob: 'DOB',
        enrollmentDate: 'Enrollment Date',
        gpa: 'GPA',
        status: 'Status',
        mentor: 'Mentor',
        attendance: 'Attendance',
        fees: 'Fees Status'
    };

    return columnKeys.map((key) => ({
        key,
        title: labels[key] || key,
        width: 140,
        editable: key !== 'id' && key !== 'rollNo', // ID and Roll No are not editable
        align: 'left',
    }));
}

export default function StudentPage() {
    const COLUMNS = useMemo(() => makeColumns(), []);
    const [data, setData] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [edits, setEdits] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Load data from API on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/student-data');
                const studentData = await response.json();
                setData(studentData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading data:', error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Save data to API
    const saveData = async (updatedData: StudentRow[]) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/student-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to save');
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (event: GridChangeEvent<StudentRow>) => {
        // Update local state
        const updatedData = data.map((row, idx) => {
            if (row.id === event.rowId) {
                return {
                    ...row,
                    [event.columnKey]: event.newValue,
                };
            }
            return row;
        });

        setData(updatedData);
        setEdits((s) => s + 1);

        // Auto-save to file after change
        saveData(updatedData);

        // Log for debugging
        console.log('Grid change event:', event);
    };

    if (loading) {
        return (
            <section className="space-y-3 p-4">
                <div className="text-slate-600">Loading student data...</div>
            </section>
        );
    }

    return (
        <section className="space-y-3 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Student Management</h2>
                    <p className="text-sm text-slate-600">Editable grid with {data.length} student records — changes are auto-saved to the database.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600">Edits: <span className="font-semibold">{edits}</span></div>
                    {isSaving && <div className="text-sm text-blue-600 animate-pulse">Saving...</div>}
                </div>
            </div>

            <div className="border rounded-md overflow-hidden" style={{ height: '700px' }}>
                <GridTableEnhanced<StudentRow>
                    columns={COLUMNS}
                    data={data}
                    onChange={handleChange}
                    editable={true}
                    keyboardNavigation={true}
                    rowHeight={36}
                    headerHeight={44}
                    bordered={true}
                    striped={false}
                    hoverable={true}
                />
            </div>
        </section>
    );
}
