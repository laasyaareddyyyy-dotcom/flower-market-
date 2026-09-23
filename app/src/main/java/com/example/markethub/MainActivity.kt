package com.example.markethub

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.markethub.data.model.*
import com.example.markethub.ui.MarketHubViewModel
import com.example.markethub.ui.components.CommodityCategoryBar
import com.example.markethub.ui.components.MarketHubHeader
import com.example.markethub.ui.components.ParchiReceiptDialog
import com.example.markethub.ui.screens.*
import com.example.markethub.ui.theme.MarkethubTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MarkethubTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MarketHubApp()
                }
            }
        }
    }
}

data class BottomNavItem(
    val id: String,
    val title: String,
    val icon: ImageVector
)

@Composable
fun MarketHubApp(
    viewModel: MarketHubViewModel = viewModel()
) {
    val currentRole by viewModel.userRole.collectAsState()
    val currentCategory by viewModel.selectedCategory.collectAsState()
    val currentLanguage by viewModel.language.collectAsState()
    val currentTab by viewModel.selectedTab.collectAsState()
    val selectedFarmerForKhata by viewModel.selectedFarmerForKhata.collectAsState()
    val saleLots by viewModel.saleLots.collectAsState()

    var activeParchiLot by remember { mutableStateOf<SaleLot?>(null) }

    val merchantNavItems = listOf(
        BottomNavItem("dashboard", "Dashboard", Icons.Default.Dashboard),
        BottomNavItem("new-sale", "New Sale", Icons.Default.PostAdd),
        BottomNavItem("farmers", "Farmers", Icons.Default.People),
        BottomNavItem("payments", "Payments", Icons.Default.Payments),
        BottomNavItem("reports", "Reports", Icons.Default.Assessment),
        BottomNavItem("helpdesk", "Support", Icons.Default.SupportAgent)
    )

    val farmerNavItems = listOf(
        BottomNavItem("farmer-parchis", "My Parchis", Icons.AutoMirrored.Filled.ReceiptLong),
        BottomNavItem("farmer-khata", "My Khata", Icons.AutoMirrored.Filled.MenuBook),
        BottomNavItem("farmer-merchants", "Merchants", Icons.Default.Storefront),
        BottomNavItem("helpdesk", "Support", Icons.Default.SupportAgent)
    )

    val currentNavItems = if (currentRole == UserRole.MERCHANT) merchantNavItems else farmerNavItems

    Scaffold(
        topBar = {
            Column {
                MarketHubHeader(
                    currentRole = currentRole,
                    onRoleChange = { viewModel.setRole(it) },
                    currentLanguage = currentLanguage,
                    onLanguageChange = { viewModel.setLanguage(it) },
                    onOpenSupport = { viewModel.setSelectedTab("helpdesk") }
                )
                CommodityCategoryBar(
                    selectedCategory = currentCategory,
                    onCategorySelected = { viewModel.setCategory(it) }
                )
            }
        },
        bottomBar = {
            NavigationBar {
                currentNavItems.forEach { item ->
                    NavigationBarItem(
                        selected = currentTab == item.id,
                        onClick = {
                            viewModel.selectFarmerForKhata(null)
                            viewModel.setSelectedTab(item.id)
                        },
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
        ) {
            when {
                currentTab == "khata-detail" && selectedFarmerForKhata != null -> {
                    FarmerKhataDetailScreen(
                        farmer = selectedFarmerForKhata!!,
                        saleLots = saleLots,
                        onBack = {
                            viewModel.selectFarmerForKhata(null)
                            viewModel.setSelectedTab("farmers")
                        }
                    )
                }

                currentRole == UserRole.MERCHANT -> {
                    when (currentTab) {
                        "dashboard" -> MerchantDashboardScreen(
                            viewModel = viewModel,
                            onNavigateToNewSale = { viewModel.setSelectedTab("new-sale") },
                            onNavigateToPayment = { viewModel.setSelectedTab("payments") },
                            onViewParchi = { lot -> activeParchiLot = lot }
                        )

                        "new-sale" -> NewSaleParchiScreen(
                            viewModel = viewModel,
                            onParchiCreated = { lot ->
                                activeParchiLot = lot
                            }
                        )

                        "farmers" -> FarmersKhataScreen(
                            viewModel = viewModel,
                            onSelectFarmerKhata = { farmer ->
                                viewModel.selectFarmerForKhata(farmer)
                            }
                        )

                        "payments" -> PaymentsSettlementScreen(viewModel = viewModel)
                        "reports" -> ReportsScreen(viewModel = viewModel)
                        "helpdesk" -> HelpdeskScreen(viewModel = viewModel)
                        else -> MerchantDashboardScreen(
                            viewModel = viewModel,
                            onNavigateToNewSale = { viewModel.setSelectedTab("new-sale") },
                            onNavigateToPayment = { viewModel.setSelectedTab("payments") },
                            onViewParchi = { lot -> activeParchiLot = lot }
                        )
                    }
                }

                currentRole == UserRole.FARMER -> {
                    when (currentTab) {
                        "helpdesk" -> HelpdeskScreen(viewModel = viewModel)
                        else -> FarmerPortalScreen(
                            viewModel = viewModel,
                            onViewParchi = { lot -> activeParchiLot = lot }
                        )
                    }
                }
            }

            // Parchi Receipt Modal Dialog
            activeParchiLot?.let { lot ->
                ParchiReceiptDialog(
                    lot = lot,
                    onDismiss = { activeParchiLot = null }
                )
            }
        }
    }
}
