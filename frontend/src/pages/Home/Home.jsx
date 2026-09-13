import React, { useState, useContext } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import ReviewsSection from '../../components/ReviewsSection/ReviewsSection'
import { StoreContext } from '../../Context/StoreContext'

const CATEGORY_ORDER = [
  'Paranthas', 'Breakfast', 'Rice Combo', 'Thali', 'Rolls',
  'Salad', 'Sandwich', 'Deserts', 'Drinks', 'Other'
]

const Home = () => {
  // food_list   = Today's Menu items  (backend filters by inTodaysMenu flag)
  // allFoodList = Every item ever     (no filter)
  const { allFoodList } = useContext(StoreContext)

  const [category, setCategory] = useState('All')
  const [viewMode, setViewMode] = useState('todays')

  // Category pills ALWAYS computed from allFoodList so they never disappear
  // based on what's in today's menu. Maintains fixed order.
  const allCategorySet = new Set(allFoodList.map(i => i.category))
  const availableCategories = CATEGORY_ORDER.filter(c => allCategorySet.has(c))

  const handleViewMode = (mode) => {
    setViewMode(mode)
    setCategory('All')
  }

  return (
    <div>
      <Header />
      <ExploreMenu
        category={category}
        setCategory={setCategory}
        viewMode={viewMode}
        setViewMode={handleViewMode}
        availableCategories={availableCategories}
      />
      <FoodDisplay
        category={category}
        viewMode={viewMode}
        allFoodList={allFoodList}
      />
      <ReviewsSection />
    </div>
  )
}

export default Home
