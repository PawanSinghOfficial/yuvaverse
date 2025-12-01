    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Landing />} />
        <Route path="dashboard" element={<Dashboard />} />
        ...
