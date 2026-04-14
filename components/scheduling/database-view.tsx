"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/data-context"

const categories = [
  "Assessment",
  "Articulation",
  "Phonology",
  "Language",
  "Fluency",
  "Motor Speech",
  "AAC",
  "Voice",
  "Other",
]

export function DatabaseView() {
  const { tests, addTest, deleteTest } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddTestOpen, setIsAddTestOpen] = useState(false)
  const [newTest, setNewTest] = useState({
    name: "",
    category: "",
    description: "",
  })

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || test.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddTest = () => {
    if (newTest.name && newTest.category) {
      addTest({
        name: newTest.name,
        category: newTest.category,
        description: newTest.description || undefined,
      })
      setNewTest({ name: "", category: "", description: "" })
      setIsAddTestOpen(false)
    }
  }

  const groupedTests = filteredTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = []
    }
    acc[test.category].push(test)
    return acc
  }, {} as Record<string, typeof tests>)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Tests & Activities Database
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tests.length} tests and activities available
          </p>
        </div>
        <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Test / Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-name">Name</Label>
                <Input
                  id="test-name"
                  placeholder="e.g., GFTA-3 Articulation Test"
                  value={newTest.name}
                  onChange={(e) =>
                    setNewTest({ ...newTest, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-category">Category</Label>
                <Select
                  value={newTest.category}
                  onValueChange={(value) =>
                    setNewTest({ ...newTest, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-description">Description (optional)</Label>
                <Textarea
                  id="test-description"
                  placeholder="Brief description of the test or activity..."
                  value={newTest.description}
                  onChange={(e) =>
                    setNewTest({ ...newTest, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleAddTest}
                disabled={!newTest.name || !newTest.category}
              >
                Add Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tests List */}
      {Object.keys(groupedTests).length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <DatabaseIcon className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
            <h3 className="mt-4 text-base font-medium text-foreground sm:text-lg">
              No tests found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Add your first test to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTests).map(([category, categoryTests]) => (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {category}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {categoryTests.length}
                </Badge>
              </div>
              <div className="grid gap-2 sm:gap-3">
                {categoryTests.map((test) => (
                  <Card
                    key={test.id}
                    className="border-border/50 transition-colors hover:border-border"
                  >
                    <CardContent className="flex items-start justify-between gap-3 p-3 sm:p-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm">
                          {test.name}
                        </h3>
                        {test.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {test.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTest(test.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete test</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}
